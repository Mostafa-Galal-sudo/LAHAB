import { Hono } from 'hono';
import type { AppEnv } from '../hono';
import { requireAdmin } from '../auth';

export const publicAssetsRouter = new Hono<AppEnv>();
export const adminAssetsRouter = new Hono<AppEnv>();

type AssetKind = 'image' | 'model' | 'video' | 'document';
interface AssetRow {
  id: string;
  kind: AssetKind;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  fileName: string;
  byteSize: number;
  metadataJson: string;
  createdAt: string;
}

const SELECT = `SELECT id, kind, storage_key AS storageKey, public_url AS publicUrl,
  mime_type AS mimeType, file_name AS fileName, byte_size AS byteSize,
  metadata_json AS metadataJson, created_at AS createdAt FROM assets`;

const RULES: Record<AssetKind, { max: number; extensions: string[]; mimes: string[] }> = {
  image: { max: 10 * 1024 * 1024, extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'], mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] },
  model: { max: 50 * 1024 * 1024, extensions: ['obj', 'glb'], mimes: ['model/obj', 'text/plain', 'model/gltf-binary', 'application/octet-stream'] },
  video: { max: 100 * 1024 * 1024, extensions: ['mp4', 'webm'], mimes: ['video/mp4', 'video/webm'] },
  document: { max: 20 * 1024 * 1024, extensions: ['pdf'], mimes: ['application/pdf'] },
};

function ascii(bytes: Uint8Array, start = 0, end = bytes.length) {
  return new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(bytes.slice(start, end));
}

async function hasValidSignature(file: File, extension: string): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  const starts = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  switch (extension) {
    case 'jpg':
    case 'jpeg': return starts(0xff, 0xd8, 0xff);
    case 'png': return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case 'gif': return ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a';
    case 'webp': return ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP';
    case 'avif': return ascii(bytes, 4, 12).startsWith('ftyp') && /avif|avis/.test(ascii(bytes, 8, 32));
    case 'obj': {
      if (bytes.includes(0)) return false;
      const source = ascii(bytes);
      return /(^|\r?\n)\s*(v|o|g)\s+/m.test(source);
    }
    case 'glb': return ascii(bytes, 0, 4) === 'glTF';
    case 'pdf': return ascii(bytes, 0, 5) === '%PDF-';
    case 'mp4': return ascii(bytes, 4, 8) === 'ftyp';
    case 'webm': return starts(0x1a, 0x45, 0xdf, 0xa3);
    default: return false;
  }
}

function toAsset(row: AssetRow) {
  let metadata: Record<string, unknown> = {};
  try { metadata = JSON.parse(row.metadataJson); } catch { /* legacy metadata */ }
  return { id: row.id, kind: row.kind, publicUrl: row.publicUrl, mimeType: row.mimeType, fileName: row.fileName, byteSize: row.byteSize, metadata, createdAt: row.createdAt };
}

publicAssetsRouter.get('/:id', async (c) => {
  const row = await c.env.DB.prepare(`${SELECT} WHERE id = ?`).bind(c.req.param('id')).first<AssetRow>();
  if (!row) return c.json({ success: false, error: 'Asset not found.' }, 404);
  return c.json({ success: true, asset: toAsset(row) });
});

publicAssetsRouter.get('/:id/content', async (c) => {
  const row = await c.env.DB.prepare(`${SELECT} WHERE id = ?`).bind(c.req.param('id')).first<AssetRow>();
  if (!row) return c.json({ success: false, error: 'Asset not found.' }, 404);
  if (row.storageKey.startsWith('bundled/')) return c.redirect(row.publicUrl, 302);
  const assetBucket = c.env.ASSET_BUCKET;
  if (!assetBucket) {
    return c.json({ success: false, error: 'Asset storage is not configured.' }, 503);
  }
  try {
    const object = await assetBucket.get(row.storageKey);
    if (!object) return c.json({ success: false, error: 'Asset binary not found.' }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', row.mimeType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('[LAHAB Assets] R2 read failed', error);
    return c.json({ success: false, error: 'Asset storage is temporarily unavailable.' }, 503);
  }
});

adminAssetsRouter.use('*', requireAdmin);

adminAssetsRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`${SELECT} ORDER BY created_at DESC, id DESC`).all<AssetRow>();
  return c.json({ success: true, assets: results.map(toAsset) });
});

adminAssetsRouter.post('/', async (c) => {
  const assetBucket = c.env.ASSET_BUCKET;
  if (!assetBucket) {
    return c.json({ success: false, error: 'Asset uploads are not configured.' }, 503);
  }
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  const kind = form?.get('kind');
  if (!(file instanceof File) || typeof kind !== 'string' || !(kind in RULES)) {
    return c.json({ success: false, error: 'A file and valid asset kind are required.' }, 400);
  }
  const typedKind = kind as AssetKind;
  const rule = RULES[typedKind];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
  const extension = safeName.toLowerCase().split('.').pop() ?? '';
  if (!safeName || safeName.startsWith('.') || !rule.extensions.includes(extension)) {
    return c.json({ success: false, error: `Unsupported ${typedKind} extension.` }, 415);
  }
  if (!rule.mimes.includes(file.type.toLowerCase())) {
    return c.json({ success: false, error: `Unsupported ${typedKind} MIME type.` }, 415);
  }
  if (file.size <= 0 || file.size > rule.max) {
    return c.json({ success: false, error: `${typedKind} files must be smaller than ${Math.round(rule.max / 1024 / 1024)} MB.` }, 413);
  }
  if (extension === 'glb' && file.type !== 'model/gltf-binary' && file.type !== 'application/octet-stream') {
    return c.json({ success: false, error: 'GLB files require a binary glTF MIME type.' }, 415);
  }
  if (extension === 'obj' && file.type !== 'model/obj' && file.type !== 'text/plain') {
    return c.json({ success: false, error: 'OBJ files require a model/obj or text/plain MIME type.' }, 415);
  }
  if (!(await hasValidSignature(file, extension))) {
    return c.json({ success: false, error: `File contents do not match the .${extension} format.` }, 415);
  }

  const id = `asset-${crypto.randomUUID()}`;
  const storageKey = `${typedKind}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const publicUrl = `/api/assets/${encodeURIComponent(id)}/content`;
  const now = new Date().toISOString();
  try {
    await assetBucket.put(storageKey, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
      customMetadata: { assetId: id, originalName: safeName, kind: typedKind },
    });
    try {
      await c.env.DB.prepare(
        `INSERT INTO assets (id, kind, storage_key, public_url, mime_type, file_name, byte_size, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, typedKind, storageKey, publicUrl, file.type, safeName, file.size, JSON.stringify({ extension, source: 'r2' }), now).run();
    } catch (error) {
      await assetBucket.delete(storageKey);
      throw error;
    }
  } catch (error) {
    console.error('[LAHAB Assets] Upload failed', error);
    return c.json({ success: false, error: 'Asset upload failed.' }, 500);
  }
  const row = await c.env.DB.prepare(`${SELECT} WHERE id = ?`).bind(id).first<AssetRow>();
  return c.json({ success: true, asset: toAsset(row!) }, 201);
});

adminAssetsRouter.delete('/:id', async (c) => {
  const assetBucket = c.env.ASSET_BUCKET;
  if (!assetBucket) {
    return c.json({ success: false, error: 'Asset storage is not configured.' }, 503);
  }
  const row = await c.env.DB.prepare(`${SELECT} WHERE id = ?`).bind(c.req.param('id')).first<AssetRow>();
  if (!row) return c.json({ success: false, error: 'Asset not found.' }, 404);
  if (row.storageKey.startsWith('bundled/')) return c.json({ success: false, error: 'Bundled compatibility assets cannot be deleted.' }, 409);
  const pageReference = await c.env.DB.prepare('SELECT 1 FROM page_revisions WHERE document_json LIKE ? LIMIT 1').bind(`%${row.id}%`).first();
  const productReference = await c.env.DB.prepare('SELECT 1 FROM products WHERE editorialImage LIKE ? LIMIT 1').bind(`%${row.id}%`).first();
  if (pageReference || productReference) {
    return c.json({ success: false, error: 'Asset is referenced by page or product history and cannot be deleted.', code: 'ASSET_IN_USE' }, 409);
  }
  try {
    await assetBucket.delete(row.storageKey);
    await c.env.DB.prepare('DELETE FROM assets WHERE id = ?').bind(row.id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error('[LAHAB Assets] Delete failed', error);
    return c.json({ success: false, error: 'Asset deletion failed.' }, 500);
  }
});
