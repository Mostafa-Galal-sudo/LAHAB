import { ProductItem, CartItem, ProductReview, GarmentSize, MonogramCustomization, ProductId } from '../types';
import type { PageDocument } from '../../shared/pageSchema';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';

const LEGACY_PRODUCT_IMAGES: Readonly<Record<string, string>> = {
  '/assets/images/streetwear_editorial_1788904807341.jpg': streetwearEditorial,
};

const withResolvedProductImage = (product: ProductItem): ProductItem => ({
  ...product,
  editorialImage: product.editorialImage ? (LEGACY_PRODUCT_IMAGES[product.editorialImage] ?? product.editorialImage) : undefined,
});

const withResolvedCartImage = (item: CartItem): CartItem => ({ ...item, product: withResolvedProductImage(item.product) });

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${text || 'Internal Error'}`);
    }
    throw new Error('Invalid server response format.');
  }
  if (!res.ok || data.success === false) {
    throw new ApiError(data.error || `Request to ${url} failed`, res.status, data);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const getProducts = () =>
  request<{ products: ProductItem[] }>('/api/products').then((d) => d.products.map(withResolvedProductImage));

export const createProduct = (payload: Partial<ProductItem>) =>
  request<{ product: ProductItem }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((d) => d.product);

export const updateProduct = (id: ProductId, payload: Partial<ProductItem>) =>
  request<{ product: ProductItem }>(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((d) => d.product);

export const deleteProduct = (id: ProductId) =>
  request<{ success: true }>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const getReviews = () => request<{ reviews: ProductReview[] }>('/api/reviews').then((d) => d.reviews);

export const createReview = (payload: Partial<ProductReview>) =>
  request<{ review: ProductReview }>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((d) => d.review);

export const likeReview = (id: string) =>
  request<{ likes: number }>(`/api/reviews/${encodeURIComponent(id)}/like`, { method: 'POST' });

export const deleteReviewApi = (id: string) =>
  request<{ success: true }>(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const getInquiriesApi = () =>
  request<{ inquiries: any[] }>('/api/inquiries').then((d) => d.inquiries);


// ---------------------------------------------------------------------------
// Cart (server-persisted per anonymous device cookie)
// ---------------------------------------------------------------------------
export const getCart = () => request<{ items: CartItem[] }>('/api/cart').then((d) => d.items.map(withResolvedCartImage));

export const addToCartApi = (productId: ProductId, size: GarmentSize, monogram?: MonogramCustomization) =>
  request<{ items: CartItem[] }>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, size, monogram }),
  }).then((d) => d.items.map(withResolvedCartImage));

export const updateCartQuantityApi = (itemId: string, delta: number) =>
  request<{ items: CartItem[] }>(`/api/cart/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  }).then((d) => d.items.map(withResolvedCartImage));

export const clearCartApi = () =>
  request<{ items: CartItem[] }>('/api/cart', { method: 'DELETE' }).then((d) => d.items.map(withResolvedCartImage));

// ---------------------------------------------------------------------------
// Wishlist (server-persisted per anonymous device cookie)
// ---------------------------------------------------------------------------
export const getWishlist = () =>
  request<{ items: { productId: ProductId; size: GarmentSize }[] }>('/api/wishlist').then((d) => d.items);

export const addToWishlistApi = (productId: ProductId, size: GarmentSize) =>
  request<{ items: { productId: ProductId; size: GarmentSize }[] }>('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId, size }),
  }).then((d) => d.items);

export const removeFromWishlistApi = (productId: ProductId) =>
  request<{ items: { productId: ProductId; size: GarmentSize }[] }>(
    `/api/wishlist/${encodeURIComponent(productId)}`,
    { method: 'DELETE' }
  ).then((d) => d.items);

// ---------------------------------------------------------------------------
// Admin auth (mounted under a random path, not /api/admin - see shared/adminSlug.ts)
// ---------------------------------------------------------------------------
import { ADMIN_PATH_SLUG } from '../../shared/adminSlug';
const ADMIN_API_BASE = `/api/${ADMIN_PATH_SLUG}`;

export const adminLogin = (username: string, password: string) =>
  request<{ username: string }>(`${ADMIN_API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const adminLogout = () => request<{ success: true }>(`${ADMIN_API_BASE}/logout`, { method: 'POST' });

export const adminMe = () => request<{ username: string }>(`${ADMIN_API_BASE}/me`);

// ---------------------------------------------------------------------------
// Published pages (validated again by the storefront before rendering)
// ---------------------------------------------------------------------------
export const getPublishedPage = (slug: string) =>
  request<{ page: unknown; revisionId: string; publishedAt: string | null }>(
    `/api/pages/${encodeURIComponent(slug)}`
  );

export interface PageRevisionSummary {
  id: string;
  pageId: string;
  schemaVersion: number;
  createdBy: number | null;
  creatorUsername: string | null;
  createdAt: string;
  publishedAt: string | null;
  isDraft: boolean;
  isPublished: boolean;
}

export interface DraftPageResponse {
  page: PageDocument;
  revisionId: string;
  publishedRevisionId: string | null;
  updatedAt: string;
}

export const getPageDraft = (slug: string) =>
  request<DraftPageResponse>(`${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/draft`);

export const savePageDraft = (slug: string, document: PageDocument, expectedDraftRevisionId: string | null) =>
  request<DraftPageResponse>(`${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/draft`, {
    method: 'PUT',
    body: JSON.stringify({ document, expectedDraftRevisionId }),
  });

export const publishPageRevision = (slug: string, revisionId: string, expectedDraftRevisionId: string | null) =>
  request<{ page: PageDocument; revisionId: string; publishedAt: string }>(
    `${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/publish`,
    { method: 'POST', body: JSON.stringify({ revisionId, expectedDraftRevisionId }) }
  );

export const getPageRevisions = (slug: string) =>
  request<{ revisions: PageRevisionSummary[] }>(
    `${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/revisions`
  ).then((response) => response.revisions);

export const getPageRevision = (slug: string, revisionId: string) =>
  request<{ revision: PageRevisionSummary & { page: PageDocument } }>(
    `${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/revisions/${encodeURIComponent(revisionId)}`
  ).then((response) => response.revision);

export const restorePageRevision = (slug: string, revisionId: string, expectedDraftRevisionId: string | null) =>
  request<DraftPageResponse & { restoredFromRevisionId: string }>(
    `${ADMIN_API_BASE}/pages/${encodeURIComponent(slug)}/revisions/${encodeURIComponent(revisionId)}/restore`,
    { method: 'POST', body: JSON.stringify({ expectedDraftRevisionId }) }
  );

export type AssetKind = 'image' | 'model' | 'video' | 'document';
export interface AssetRecord {
  id: string;
  kind: AssetKind;
  publicUrl: string;
  mimeType: string;
  fileName: string;
  byteSize: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const getAssets = () =>
  request<{ assets: AssetRecord[] }>(`${ADMIN_API_BASE}/assets`).then((response) => response.assets);

export const getAsset = (id: string) =>
  request<{ asset: AssetRecord }>(`/api/assets/${encodeURIComponent(id)}`).then((response) => response.asset);

export const deleteAsset = (id: string) =>
  request<{ success: true }>(`${ADMIN_API_BASE}/assets/${encodeURIComponent(id)}`, { method: 'DELETE' });

export function uploadAsset(file: File, kind: AssetKind, onProgress?: (percent: number) => void): Promise<AssetRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ADMIN_API_BASE}/assets`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new ApiError('Asset upload failed.', 0));
    xhr.onload = () => {
      let payload: { asset?: AssetRecord; error?: string } = {};
      try { payload = JSON.parse(xhr.responseText); } catch { /* handled below */ }
      if (xhr.status >= 200 && xhr.status < 300 && payload.asset) resolve(payload.asset);
      else reject(new ApiError(payload.error ?? 'Asset upload failed.', xhr.status, payload as Record<string, unknown>));
    };
    const data = new FormData();
    data.append('file', file);
    data.append('kind', kind);
    xhr.send(data);
  });
}
