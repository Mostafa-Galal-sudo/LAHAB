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
  createdAt: string;
  publishedAt: string | null;
}

function parseAndValidateDocument(json: string): { document?: PageDocument; errors?: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { errors: ['Stored page document is not valid JSON.'] };
  }

  const validation = validatePageDocument(parsed);
  if (!validation.valid) return { errors: validation.errors };
  return { document: parsed as PageDocument };
}

async function getPage(c: Context<AppEnv>, slug: string) {
  return c.env.DB.prepare(
    `SELECT
      id, slug, title,
      draft_revision_id AS draftRevisionId,
      published_revision_id AS publishedRevisionId,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM pages WHERE slug = ?`
  ).bind(slug).first<PageRow>();
}

async function getRevision(c: Context<AppEnv>, revisionId: string) {
  return c.env.DB.prepare(
    `SELECT
      id, page_id AS pageId, schema_version AS schemaVersion,
      document_json AS documentJson, created_by AS createdBy,
      created_at AS createdAt, published_at AS publishedAt
    FROM page_revisions WHERE id = ?`
  ).bind(revisionId).first<RevisionRow>();
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

  return c.json({ success: true, page: parsed.document, revisionId: revision.id, updatedAt: page.updatedAt });
});

adminPagesRouter.put('/:slug/draft', async (c) => {
  const body = await c.req.json().catch(() => null) as { document?: unknown } | null;
  const validation = validatePageDocument(body?.document);
  if (!validation.valid) {
    return c.json({ success: false, error: 'Invalid page document.', validationErrors: validation.errors }, 400);
  }

  const document = body!.document as PageDocument;
  const slug = c.req.param('slug');
  if (document.slug !== slug) {
    return c.json({ success: false, error: 'Document slug must match the requested page slug.' }, 400);
  }

  const page = await getPage(c, slug);
  if (!page) return c.json({ success: false, error: 'Page not found.' }, 404);
  if (document.id !== page.id) {
    return c.json({ success: false, error: 'Document ID must match the existing page.' }, 400);
  }

  const documentJson = JSON.stringify(document);
  if (new TextEncoder().encode(documentJson).byteLength > 512_000) {
    return c.json({ success: false, error: 'Page document exceeds the 500 KB limit.' }, 413);
  }

  const revisionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const admin = c.get('admin')!;
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO page_revisions
        (id, page_id, schema_version, document_json, created_by, created_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`
    ).bind(revisionId, page.id, document.schemaVersion, documentJson, admin.id, now),
    c.env.DB.prepare(
      'UPDATE pages SET title = ?, draft_revision_id = ?, updated_at = ? WHERE id = ?'
    ).bind(document.title.en, revisionId, now, page.id),
  ]);

  return c.json({ success: true, page: document, revisionId, updatedAt: now });
});

adminPagesRouter.post('/:slug/publish', async (c) => {
  const page = await getPage(c, c.req.param('slug'));
  if (!page || !page.draftRevisionId) return c.json({ success: false, error: 'Draft page not found.' }, 404);

  const revision = await getRevision(c, page.draftRevisionId);
  if (!revision) return c.json({ success: false, error: 'Draft revision not found.' }, 500);

  const parsed = parseAndValidateDocument(revision.documentJson);
  if (!parsed.document) {
    return c.json({ success: false, error: 'Draft cannot be published because it is invalid.', validationErrors: parsed.errors }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE page_revisions SET published_at = ? WHERE id = ?').bind(now, revision.id),
    c.env.DB.prepare('UPDATE pages SET published_revision_id = ?, updated_at = ? WHERE id = ?').bind(revision.id, now, page.id),
  ]);

  return c.json({ success: true, page: parsed.document, revisionId: revision.id, publishedAt: now });
});
