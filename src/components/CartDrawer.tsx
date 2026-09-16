import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCw,
} from 'lucide-react';
import { CartItem } from '../types';
import { TranslationSchema, Language } from '../translations';
import { GlossyCard } from './GlossyCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, size: string, delta: number) => void;
  onProceedToCheckout: () => void;
  t: TranslationSchema['cart'];
  language: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onProceedToCheckout,
  t,
  language,
}) => {
  const isArabic = language === 'ar';

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalEGP = items.reduce(
    (sum, item) => sum + (item.product.priceEGP + (item.monogram ? 350 : 0)) * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#070E18]/85 backdrop-blur-md transition-opacity"
            onClick={onClose}
          />

          {/* Slide-in Panel */}
          <motion.div
            id="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-lg bg-[#0A1320] border-l border-[#D8A065]/40 flex flex-col justify-between h-full text-[#E2E6E8] shadow-[0_0_60px_rgba(0,0,0,0.9)]"
          >
            {/* Glossy Header Bar */}
            <div className="p-6 border-b border-[#E2E6E8]/15 bg-[#0D1929]/90 flex items-center justify-between shrink-0 relative backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#D8A065]/50 bg-[#132238] flex items-center justify-center text-[#D8A065] shadow-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-[#D8A065] tracking-wider uppercase flex items-center gap-2">
                    <span>{t.title}</span>
                    <span className="font-mono text-xs px-2 py-0.5 border border-[#D8A065]/40 bg-[#132238] text-[#E2E6E8]">
                      {totalQuantity}
                    </span>
                  </h2>
                  <span className="font-body text-xs text-[#E2E6E8]/70 block mt-0.5">
                    {t.reservedCount(totalQuantity)}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 border border-[#E2E6E8]/20 flex items-center justify-center text-sm text-[#E2E6E8]/70 hover:text-[#D8A065] hover:border-[#D8A065] transition-colors cursor-pointer bg-[#132238]/40"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full border border-[#D8A065]/40 bg-[#132238]/60 flex items-center justify-center mx-auto text-[#D8A065]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <span className="font-heading text-base text-[#E2E6E8] block tracking-widest uppercase">
                    {t.emptyTitle}
                  </span>
                  <p className="font-body text-xs text-[#E2E6E8]/70 max-w-xs mx-auto leading-relaxed">
                    {t.emptyDesc}
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-lahab-outline px-8 py-3 text-xs font-bold mt-2 cursor-pointer uppercase tracking-wider"
                  >
                    {t.exploreBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <GlossyCard
                      key={`${item.product.id}-${item.size}-${item.monogram?.text || 'none'}`}
                      className="p-4 border border-[#E2E6E8]/20 bg-[#0D1929]/90 shadow-xl"
                      glowColor="rgba(216, 160, 101, 0.2)"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image Thumbnail */}
                        {item.product.editorialImage && (
                          <div className="w-20 h-24 bg-[#070D14] border border-[#D8A065]/30 overflow-hidden shrink-0 relative group">
                            <img
                              src={item.product.editorialImage}
                              alt={item.product.name[language]}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-1 left-1 bg-[#0D1929]/90 border border-[#D8A065]/50 px-1 py-0.5 font-mono text-[9px] text-[#D8A065]">
                              {item.size}
                            </div>
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[10px] text-[#D8A065] font-bold block">
                                {item.product.code}
                              </span>
                              <h4 className="font-heading text-sm text-[#E2E6E8] uppercase tracking-wide">
                                {item.product.name[language]}
                              </h4>
                            </div>

                            <span className="font-mono text-sm font-bold text-[#D8A065]">
                              {isArabic
                                ? `${((item.product.priceEGP + (item.monogram ? 350 : 0)) * item.quantity).toLocaleString('ar-EG')} ج.م`
                                : `${((item.product.priceEGP + (item.monogram ? 350 : 0)) * item.quantity).toLocaleString()} EGP`}
                            </span>
                          </div>

                          {/* Bespoke Gold Monogram Badge */}
                          {item.monogram && (
                            <div className="p-2 bg-[#132238] border border-[#D8A065]/50 text-[10px] font-mono text-[#D8A065] flex items-center gap-1.5 shadow-inner">
                              <Sparkles className="w-3 h-3 text-[#D8A065] shrink-0 animate-pulse" />
                              <span>
                                {isArabic ? 'تطريز ذهبي مخصص:' : 'GOLD MONOGRAM:'} "{item.monogram.text}" ({item.monogram.placement.toUpperCase()}) (+350 EGP)
                              </span>
                            </div>
                          )}

                          {/* Controls Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#E2E6E8]/10 text-xs">
                            <span className="font-mono text-xs text-[#E2E6E8]/70">
                              {isArabic ? `المقاس: ${item.size}` : `SIZE: ${item.size}`}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-[#E2E6E8]/30 bg-[#132238]/60">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.size, -1)
                                }
                                className="p-1.5 text-[#E2E6E8] hover:bg-[#D8A065] hover:text-[#0D1929] transition-colors cursor-pointer"
                                title="Decrease quantity"
                              >
                                {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                              </button>

                              <span className="px-3 py-1 font-mono font-bold text-xs text-[#E2E6E8]">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.size, 1)
                                }
                                className="p-1.5 text-[#E2E6E8] hover:bg-[#D8A065] hover:text-[#0D1929] transition-colors cursor-pointer"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlossyCard>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout CTA */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#E2E6E8]/20 bg-[#0D1929]/95 space-y-4 shrink-0 backdrop-blur-md">
                {/* Shipping & Vault Perks Highlights */}
                <div className="p-3 bg-[#132238]/70 border border-[#D8A065]/40 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[#D8A065]">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t.shippingLabel}:</span>
                    </div>
                    <span className="font-bold text-green-400">{t.shippingVal}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#E2E6E8]/80 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D8A065]" />
                      <span>{t.batchLabel}:</span>
                    </div>
                    <span>{t.batchVal}</span>
                  </div>
                </div>

                {/* Financial Total */}
                <div className="flex items-center justify-between text-lg font-heading text-[#D8A065] pt-1 border-t border-[#E2E6E8]/15">
                  <span className="uppercase tracking-wider">{t.totalLabel}</span>
                  <span className="font-mono font-bold text-xl text-[#E2E6E8]">
                    {isArabic
                      ? `${subtotalEGP.toLocaleString('ar-EG')} ج.م`
                      : `${subtotalEGP.toLocaleString()} EGP`}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  id="checkout-button"
                  onClick={onProceedToCheckout}
                  className="w-full btn-lahab-primary py-4 text-xs font-bold flex items-center justify-center gap-3 cursor-pointer shadow-xl uppercase tracking-widest group"
                >
                  <span>{t.checkoutBtn}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

