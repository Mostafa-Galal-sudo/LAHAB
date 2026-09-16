import type {
  GarmentSize,
  MonogramCustomization,
  ProductId,
  ProductItem,
  ProductReview,
  Theme,
} from '../types';
import type { Language, TranslationSchema } from '../translations';

/** Runtime commerce and UI behavior supplied to page-section adapters. */
export interface StorefrontContext {
  products: ProductItem[];
  reviews: ProductReview[];
  language: Language;
  isArabic: boolean;
  theme: Theme;
  currency: string;
  translations: TranslationSchema;
  selectedReviewsProductId?: ProductId;
  savedProductIds: string[];
  onAddToCart: (product: ProductItem, size: GarmentSize, monogram?: MonogramCustomization) => void;
  onToggleWishlist: (productId: ProductId, size: GarmentSize) => void;
  onOpenMonogram: (product: ProductItem, size: GarmentSize) => void;
  onOpenFitVisualizer: () => void;
  onOpenReviews: (productId: ProductId) => void;
  onOpenSizeGuide: () => void;
  onReviewsChanged: () => void;
  onScrollToProducts: () => void;
  onShopLook: (productId: ProductId, size: GarmentSize) => void;
}

