import React from 'react';
import { motion } from 'motion/react';
import { ProductItem, GarmentSize, ProductId, ProductReview } from '../types';
import ProductCard from './ProductCard';
import { TranslationSchema, Language } from '../translations';

interface ProductShowcaseProps {
  products: ProductItem[];
  reviews?: ProductReview[];
  onAddToCart: (product: ProductItem, size: GarmentSize) => void;
  onOpenMonogram?: (product: ProductItem, size: GarmentSize) => void;
  onOpenFitVisualizer?: () => void;
  onOpenReviews?: (productId: ProductId) => void;
  onViewIn3D?: (productId: ProductId) => void;
  savedProductIds?: string[];
  onToggleSave?: (productId: ProductId, size: GarmentSize) => void;
  t: TranslationSchema['showcase'];
  language: Language;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 55, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  products,
  reviews = [],
  onAddToCart,
  onOpenMonogram,
  onOpenFitVisualizer,
  onOpenReviews,
  onViewIn3D,
  savedProductIds = [],
  onToggleSave,
  t,
  language,
}) => {
  return (
    <section
      id="products"
      className="bg-[#0D1929] text-[#E2E6E8] px-5 sm:px-10 lg:px-16 py-20 sm:py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      {/* Background atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#D8A065]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header with smooth scroll entrance */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 mb-16 border-b border-[#E2E6E8]/20"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-2.5 bg-[#D8A065]" />
              <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                {t.badge}
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl text-[#D8A065] tracking-wide uppercase">
              {t.title}
            </h2>
          </div>

          <div className="font-body text-xs text-[#E2E6E8] border border-[#D8A065]/40 px-4 py-2 bg-[#132238]/60">
            <span className="text-[#D8A065] font-bold">● </span>
            {t.limitedUnits}
          </div>
        </motion.div>

        {/* Staggered Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.12 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12"
        >
          {products.map((product) => {
            const productReviews = reviews.filter((r) => r.productId === product.id);
            const avgRating =
              productReviews.length > 0
                ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
                : 0;
            return (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenMonogram={onOpenMonogram}
                  onOpenFitVisualizer={onOpenFitVisualizer}
                  onOpenReviews={onOpenReviews}
                  onViewIn3D={onViewIn3D}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                  reviewsCount={productReviews.length}
                  averageRating={avgRating}
                  t={t}
                  language={language}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Assurance Box with scroll entrance */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 p-8 border border-[#E2E6E8]/20 bg-[#132238]/40 flex flex-col sm:flex-row items-center justify-between gap-6 card-hover-alive"
        >
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-heading text-xs text-[#D8A065] tracking-widest block uppercase">
              {t.assuranceTitle}
            </span>
            <p className="font-body text-xs text-[#E2E6E8]/80 max-w-2xl">
              {t.assuranceDesc}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#D8A065]">
            <span className="border border-[#D8A065]/40 px-3 py-1">520 GSM</span>
            <span className="border border-[#D8A065]/40 px-3 py-1">290 GSM</span>
            <span className="border border-[#D8A065]/40 px-3 py-1">100% COMBED</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default ProductShowcase;
