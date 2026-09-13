import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { ProductItem, GarmentSize, WishlistItem } from '../types';
import { Language } from '../translations';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: WishlistItem[];
  products: ProductItem[];
  onRemoveItem: (productId: string, size: GarmentSize) => void;
  onMoveToBag: (product: ProductItem, size: GarmentSize) => void;
  onExploreProducts: () => void;
  language: Language;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  products,
  onRemoveItem,
  onMoveToBag,
  onExploreProducts,
  language,
}) => {
  const isArabic = language === 'ar';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070D14]/80 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: isArabic ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '-100%' : '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen max-w-md bg-[#0D1929] border-l border-[#D8A065]/40 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E2E6E8]/20 bg-[#132238]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#D8A065] flex items-center justify-center bg-[#0D1929] text-[#D8A065]">
                  <Heart className="w-4 h-4 fill-[#D8A065]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[#E2E6E8] uppercase tracking-wide">
                    {isArabic ? 'القطع المحفوظة' : 'SAVED PIECES'}
                  </h3>
                  <span className="text-[11px] font-mono text-[#D8A065]">
                    {savedItems.length} {isArabic ? 'قطعة محفوظة' : 'ITEM(S) IN ARCHIVE'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#E2E6E8]/70 hover:text-[#D8A065] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {savedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-[#D8A065]/30 flex items-center justify-center text-[#D8A065] bg-[#132238]">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading text-base text-[#E2E6E8] uppercase">
                      {isArabic ? 'لا توجد قطع محفوظة حالياً' : 'YOUR SAVED LIST IS EMPTY'}
                    </h4>
                    <p className="font-body text-xs text-[#E2E6E8]/60 max-w-xs">
                      {isArabic
                        ? 'احفظ قطعك المفضلة من الإصدار الأول بالضغط على أيقونة القلب لمتابعتها أو حجزها لاحقاً.'
                        : 'Tap the bookmark icon on any piece to save it to your private session list for later review.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onExploreProducts();
                    }}
                    className="btn-lahab-primary px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer mt-4"
                  >
                    <span>{isArabic ? 'استكشاف قطع المجموعة' : 'EXPLORE COLLECTION'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                savedItems.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  return (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="border border-[#E2E6E8]/20 bg-[#132238]/40 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-heading text-[10px] text-[#D8A065] tracking-wider uppercase block">
                            {prod.code}
                          </span>
                          <h4 className="font-heading text-sm text-[#E2E6E8] uppercase">
                            {prod.name[language]}
                          </h4>
                          <span className="text-xs text-[#E2E6E8]/60 font-mono">
                            {isArabic ? `المقاس: ${item.size}` : `Size: ${item.size}`} // {prod.weight}
                          </span>
                        </div>

                        <div className="text-right font-mono text-sm font-bold text-[#E2E6E8]">
                          {isArabic
                            ? `${prod.priceEGP.toLocaleString('ar-EG')} ج.م`
                            : `${prod.priceEGP.toLocaleString()} EGP`}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E6E8]/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onMoveToBag(prod, item.size);
                            onRemoveItem(item.productId, item.size);
                          }}
                          className="flex-1 btn-lahab-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'نقل إلى الحقيبة' : 'MOVE TO BAG'}</span>
                        </button>

                        <button
                          onClick={() => onRemoveItem(item.productId, item.size)}
                          className="p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/60 hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {savedItems.length > 0 && (
              <div className="p-6 border-t border-[#E2E6E8]/20 bg-[#132238]/60 space-y-3">
                <button
                  onClick={() => {
                    savedItems.forEach((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      if (prod) onMoveToBag(prod, item.size);
                    });
                    onClose();
                  }}
                  className="w-full btn-lahab-primary py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isArabic ? 'إضافة كافة المحفوظات للحقيبة' : 'MOVE ALL TO SHOPPING BAG'}</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default WishlistDrawer;
