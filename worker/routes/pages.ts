import { Hono, type Context } from 'hono';
import type { AppEnv } from '../hono';
import { requireAdmin } from '../auth';
import { validatePageDocument } from '../../shared/pageSchemaValidation';
import type { PageDocument } from '../../shared/pageSchema';

export const publicPagesRouter = new Hono<AppEnv>();
export const adminPagesRouter = new Hono<AppEnv>();

interface PageRow {
  id: string;
  slug: string;
  title: string;
  draftRevisionId: string | null;
  publishedRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RevisionRow {
  id: string;
  pageId: string;
  schemaVersion: number;
  documentJson: string;
  createdBy: number | null;
  creatorUsername: string | null;
  createdAt: string;
  publishedAt: string | null;
}

const REVISION_SELECT = `SELECT
  r.id, r.page_id AS pageId, r.schema_version AS schemaVersion,
  r.document_json AS documentJson, r.created_by AS createdBy,
  u.username AS creatorUsername, r.created_at AS createdAt,
  r.published_at AS publishedAt
FROM page_revisions r
LEFT JOIN admin_users u ON u.id = r.created_by`;

function parseAndValidateDocument(json: string): { document?: PageDocument; errors?: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { errors: ['Stored page document is not valid JSON.'] };
  }
  const validation = validatePageDocument(parsed);
  return validation.valid ? { document: parsed as PageDocument } : { errors: validation.errors };
}

async function getPage(c: Context<AppEnv>, slug: string) {
  return c.env.DB.prepare(
    `SELECT id, slug, title,
      draft_revision_id AS draftRevisionId,
      published_revision_id AS publishedRevisionId,
      created_at AS createdAt, updated_at AS updatedAt
    FROM pages WHERE slug = ?`
  ).bind(slug).first<PageRow>();
}

async function getRevision(c: Context<AppEnv>, revisionId: string) {
  return c.env.DB.prepare(`${REVISION_SELECT} WHERE r.id = ?`)
    .bind(revisionId)
    .first<RevisionRow>();
}

function revisionPayload(revision: RevisionRow, page: PageRow, document?: PageDocument) {
  return {
    id: revision.id,
    pageId: revision.pageId,
    schemaVersion: revision.schemaVersion,
    createdBy: revision.createdBy,
    creatorUsername: revision.creatorUsername,
    createdAt: revision.createdAt,
    publishedAt: revision.publishedAt,
    isDraft: page.draftRevisionId === revision.id,
    isPublished: page.publishedRevisionId === revision.id,
    ...(document ? { page: document } : {}),
  };
}

function changed(result: D1Result<unknown> | undefined) {
  return Number(result?.meta?.changes ?? 0) > 0;
}

// Public consumers only receive the explicitly published revision.
publicPagesRouter.get('/:slug', async (c) => {
  const page = await getPage(c, c.req.param('slug'));
  if (!page || !page.publishedRevisionId) {
    return c.json({ success: false, error: 'Published page not found.' }, 404);
  }
  const revision = await getRevision(c, page.publishedRevisionId);
  if (!revision) return c.json({ success: false, error: 'Published page revision not found.' }, 500);
  const parsed = parseAndValidateDocument(revision.documentJson);
  if (!parsed.document) {
    console.error('[LAHAB Pages] Invalid published document:', parsed.errors);
    return c.json({ success: false, error: 'Published page document is invalid.' }, 500);
  }
  return c.json({ success: true, page: parsed.document, revisionId: revision.id, publishedAt: revision.publishedAt });
});

adminPagesRouter.use('*', requireAdmin);

adminPagesRouter.get('/:slug/draft', async (c) => {
  const page = await getPage(c, c.req.param('slug'));
  if (!page || !page.draftRevisionId) return c.json({ success: false, error: 'Draft page not found.' }, 404);
  const revision = await getRevision(c, page.draftRevisionId);
  if (!revision) return c.json({ success: false, error: 'Draft revision not found.' }, 500);
  const parsed = parseAndValidateDocument(revision.documentJson);
  if (!parsed.document) {
    return c.json({ success: false, error: 'Draft page document is invalid.', validationErrors: parsed.errors }, 500);
  }
  return c.json({ success: true, page: parsed.document, revisionId: revision.id, publishedRevisionId: page.publishedRevisionId, updatedAt: page.updatedAt });
});

adminPagesRouter.put('/:slug/draft', async (c) => {
  const body = await c.req.json().catch(() => null) as { document?: unknown; expectedDraftRevisionId?: string | null } | null;
  if (!body || !Object.prototype.hasOwnProperty.call(body, 'expectedDraftRevisionId')) {
    return c.json({ success: false, error: 'expectedDraftRevisionId is required.' }, 400);
  }
  const validation = validatePageDocument(body.document);
  if (!validation.valid) {
    return c.json({ success: false, error: 'Invalid page document.', validationErrors: validation.errors }, 422);
  }
  const document = body.document as PageDocument;
  const slug = c.req.param('slug');
  const page = await getPage(c, slug);
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  if (document.slug !== slug || document.id !== page.id) {
    return c.json({ success: false, error: 'Document identity must match the requested page.' }, 400);
  }
  const documentJson = JSON.stringify(document);
  if (new TextEncoder().encode(documentJson).byteLength > 512_000) {
    return c.json({ success: false, error: 'Page document exceeds the 500 KB limit.' }, 413);
  }

  const revisionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const admin = c.get('admin')!;
  const results = await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO page_revisions
        (id, page_id, schema_version, document_json, created_by, created_at, published_at)
       SELECT ?, id, ?, ?, ?, ?, NULL FROM pages
       WHERE id = ? AND draft_revision_id IS ?`
    ).bind(revisionId, document.schemaVersion, documentJson, admin.id, now, page.id, body.expectedDraftRevisionId),
    c.env.DB.prepare(
      `UPDATE pages SET title = ?, draft_revision_id = ?, updated_at = ?
       WHERE id = ? AND draft_revision_id IS ?
         AND EXISTS (SELECT 1 FROM page_revisions WHERE id = ?)`
    ).bind(document.title.en, revisionId, now, page.id, body.expectedDraftRevisionId, revisionId),
  ]);
  if (!changed(results[0]) || !changed(results[1])) {
    return c.json({ success: false, error: 'Draft changed since it was loaded.', code: 'DRAFT_CONFLICT', currentDraftRevisionId: (await getPage(c, slug))?.draftRevisionId ?? null }, 409);
  }
  return c.json({ success: true, page: document, revisionId, publishedRevisionId: page.publishedRevisionId, updatedAt: now });
});

adminPagesRouter.get('/:slug/revisions', async (c) => {
  const page = await getPage(c, c.req.param('slug'));
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  const { results } = await c.env.DB.prepare(
    `${REVISION_SELECT} WHERE r.page_id = ? ORDER BY r.created_at DESC, r.id DESC LIMIT 200`
  ).bind(page.id).all<RevisionRow>();
  return c.json({ success: true, revisions: results.map((revision) => revisionPayload(revision, page)) });
});

adminPagesRouter.get('/:slug/revisions/:revisionId', async (c) => {
  const page = await getPage(c, c.req.param('slug'));
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  const revision = await getRevision(c, c.req.param('revisionId'));
  if (!revision || revision.pageId !== page.id) return c.json({ success: false, error: 'Revision not found.' }, 404);
  const parsed = parseAndValidateDocument(revision.documentJson);
  if (!parsed.document) return c.json({ success: false, error: 'Stored revision is invalid.' }, 500);
  return c.json({ success: true, revision: revisionPayload(revision, page, parsed.document) });
});

adminPagesRouter.post('/:slug/revisions/:revisionId/restore', async (c) => {
  const body = await c.req.json().catch(() => null) as { expectedDraftRevisionId?: string | null } | null;
  if (!body || !Object.prototype.hasOwnProperty.call(body, 'expectedDraftRevisionId')) {
    return c.json({ success: false, error: 'expectedDraftRevisionId is required.' }, 400);
  }
  const page = await getPage(c, c.req.param('slug'));
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  const source = await getRevision(c, c.req.param('revisionId'));
  if (!source || source.pageId !== page.id) return c.json({ success: false, error: 'Revision not found.' }, 404);
  const parsed = parseAndValidateDocument(source.documentJson);
  if (!parsed.document) return c.json({ success: false, error: 'Revision cannot be restored because it is invalid.' }, 422);

  const revisionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const admin = c.get('admin')!;
  const results = await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO page_revisions
        (id, page_id, schema_version, document_json, created_by, created_at, published_at)
       SELECT ?, id, ?, ?, ?, ?, NULL FROM pages
       WHERE id = ? AND draft_revision_id IS ?`
    ).bind(revisionId, source.schemaVersion, source.documentJson, admin.id, now, page.id, body.expectedDraftRevisionId),
    c.env.DB.prepare(
      `UPDATE pages SET draft_revision_id = ?, updated_at = ?
       WHERE id = ? AND draft_revision_id IS ?
         AND EXISTS (SELECT 1 FROM page_revisions WHERE id = ?)`
    ).bind(revisionId, now, page.id, body.expectedDraftRevisionId, revisionId),
  ]);
  if (!changed(results[0]) || !changed(results[1])) {
    return c.json({ success: false, error: 'Draft changed since it was loaded.', code: 'DRAFT_CONFLICT', currentDraftRevisionId: (await getPage(c, page.slug))?.draftRevisionId ?? null }, 409);
  }
  return c.json({ success: true, page: parsed.document, revisionId, restoredFromRevisionId: source.id, publishedRevisionId: page.publishedRevisionId, updatedAt: now });
});

adminPagesRouter.post('/:slug/publish', async (c) => {
  const body = await c.req.json().catch(() => null) as { revisionId?: string; expectedDraftRevisionId?: string | null } | null;
  if (!body?.revisionId || !Object.prototype.hasOwnProperty.call(body, 'expectedDraftRevisionId')) {
    return c.json({ success: false, error: 'revisionId and expectedDraftRevisionId are required.' }, 400);
  }
  const page = await getPage(c, c.req.param('slug'));
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  const revision = await getRevision(c, body.revisionId);
  if (!revision || revision.pageId !== page.id) return c.json({ success: false, error: 'Revision not found.' }, 404);
  const parsed = parseAndValidateDocument(revision.documentJson);
  if (!parsed.document) {
    return c.json({ success: false, error: 'Revision cannot be published because it is invalid.', validationErrors: parsed.errors }, 422);
  }

  const now = new Date().toISOString();
  const results = await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE page_revisions SET published_at = COALESCE(published_at, ?)
       WHERE id = ? AND EXISTS (SELECT 1 FROM pages WHERE id = ? AND draft_revision_id IS ?)`
    ).bind(now, revision.id, page.id, body.expectedDraftRevisionId),
    c.env.DB.prepare(
      `UPDATE pages SET published_revision_id = ?, updated_at = ?
       WHERE id = ? AND draft_revision_id IS ?`
    ).bind(revision.id, now, page.id, body.expectedDraftRevisionId),
  ]);
  if (!changed(results[1])) {
    return c.json({ success: false, error: 'Draft changed since it was loaded.', code: 'DRAFT_CONFLICT', currentDraftRevisionId: (await getPage(c, page.slug))?.draftRevisionId ?? null }, 409);
  }
  return c.json({ success: true, page: parsed.document, revisionId: revision.id, publishedAt: now });
});
