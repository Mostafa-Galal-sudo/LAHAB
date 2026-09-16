export type ProductId = string;

export type Theme = 'navy' | 'desert';

export type GarmentView = 'front' | 'back';

export type GarmentSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductItem {
  id: ProductId;
  code: string;
  name: Record<'en' | 'ar', string>;
  priceEGP: number;
  weight: string;
  fit: Record<'en' | 'ar', string>;
  material: Record<'en' | 'ar', string>;
  description: Record<'en' | 'ar', string>;
  frontDetail: Record<'en' | 'ar', string>;
  backDetail: Record<'en' | 'ar', string>;
  sizes: GarmentSize[];
  outOfStockSizes?: GarmentSize[];
  tags: Record<'en' | 'ar', string[]>;
  editorialImage?: string;
}

export interface MonogramCustomization {
  text: string;
  placement: 'chest' | 'cuff' | 'nape';
  thread: 'gold' | 'silver' | 'bronze';
  style: 'geometric' | 'calligraphy';
}

export interface CartItem {
  id?: string; // server-assigned row id (present once persisted)
  product: ProductItem;
  size: GarmentSize;
  quantity: number;
  monogram?: MonogramCustomization;
}

export interface WishlistItem {
  productId: ProductId;
  size: GarmentSize;
  addedAt?: number;
}

export interface ProductReview {
  id: string;
  productId: ProductId;
  authorName: string;
  rating: number; // 1 to 5
  date: string;
  verifiedPurchase: boolean;
  verifiedWearer?: boolean;
  sizePurchased?: GarmentSize;
  city?: string;
  title: string;
  comment: string;
  likes: number;
  photos?: string[]; // Client fit images (data URLs or remote URLs)
  clientStats?: {
    heightCm?: number;
    weightKg?: number;
  };
}

