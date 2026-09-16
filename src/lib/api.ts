import { ProductItem, CartItem, ProductReview, GarmentSize, MonogramCustomization, ProductId } from '../types';

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
    throw new Error(data.error || `Request to ${url} failed`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const getProducts = () =>
  request<{ products: ProductItem[] }>('/api/products').then((d) => d.products);

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
export const getCart = () => request<{ items: CartItem[] }>('/api/cart').then((d) => d.items);

export const addToCartApi = (productId: ProductId, size: GarmentSize, monogram?: MonogramCustomization) =>
  request<{ items: CartItem[] }>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, size, monogram }),
  }).then((d) => d.items);

export const updateCartQuantityApi = (itemId: string, delta: number) =>
  request<{ items: CartItem[] }>(`/api/cart/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  }).then((d) => d.items);

export const clearCartApi = () =>
  request<{ items: CartItem[] }>('/api/cart', { method: 'DELETE' }).then((d) => d.items);

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
