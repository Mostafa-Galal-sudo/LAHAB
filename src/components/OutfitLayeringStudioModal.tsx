import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Plus, Check, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { ProductItem, GarmentSize } from '../types';
import { Language } from '../translations';
import Wordmark from './Wordmark';

interface OutfitLayeringStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  language: Language;
  onAddOutfitToBag: (items: { product: ProductItem; size: GarmentSize }[]) => void;
}

export const OutfitLayeringStudioModal: React.FC<OutfitLayeringStudioModalProps> = ({
  isOpen,
  onClose,
  products,
  language,
  onAddOutfitToBag,
}) => {
  const isArabic = language === 'ar';
  const [selectedTop, setSelectedTop] = useState<ProductItem | null>(products[0] || null);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('L');
  const [includeMonogram, setIncludeMonogram] = useState(true);

  if (!isOpen) return null;

  const basePrice = selectedTop ? selectedTop.priceEGP : 4850;
  const monogramPrice = includeMonogram ? 350 : 0;
  const totalPrice = basePrice + monogramPrice;

  const handleAddOutfit = () => {
    if (!selectedTop) return;
    onAddOutfitToBag([{ product: selectedTop, size: selectedSize }]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070D14]/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0D1929] border-2 border-[#D8A065] text-[#E2E6E8] shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#D8A065]/40 bg-[#132238]/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#D8A065] flex items-center justify-center bg-[#0D1929] text-[#D8A065]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                  {isArabic ? 'استوديو تنسيق الإطلالات والمعاينة الحية' : 'LAHAB OUTFIT LAYERING STUDIO'}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'صمّم إطلالة الشارع الخاصة بك' : 'Bespoke Archival Layering Studio'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 border border-[#E2E6E8]/20 hover:border-[#D8A065] text-[#E2E6E8] hover:text-[#D8A065] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
            {/* Visual Canvas Viewport */}
            <div className="md:col-span-6 relative aspect-4/5 bg-[#070D14] border border-[#D8A065]/30 overflow-hidden flex items-center justify-center group">
              {selectedTop?.editorialImage && (
                <img
                  src={selectedTop.editorialImage}
                  alt="Outfit Preview"
                  className="w-full h-full object-cover filter contrast-105"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-transparent to-transparent opacity-80" />

              {/* Layer Badge Overlays */}
              <div className="absolute top-4 left-4 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1929]/90 border border-[#D8A065] text-[10px] font-heading text-[#D8A065] backdrop-blur-md uppercase">
                  <span className="w-1.5 h-1.5 bg-[#D8A065] rounded-full animate-ping" />
                  {isArabic ? 'الطبقة الأساسية: 520 GSM' : 'BASE LAYER: 520 GSM HOODIE'}
                </span>
                {includeMonogram && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1929]/90 border border-[#E2E6E8]/40 text-[10px] font-mono text-[#E2E6E8] backdrop-blur-md uppercase">
                    {isArabic ? '+ تطريز حروف ذهبي مخصص' : '+ BESPOKE GOLD THREAD MONOGRAM'}
                  </div>
                )}
              </div>

              {/* Live Canvas Silhouette Tag */}
              <div className="absolute bottom-4 inset-x-4 p-3 bg-[#0D1929]/95 border border-[#D8A065]/50 backdrop-blur-md text-xs font-mono flex items-center justify-between text-[#D8A065]">
                <span>{selectedTop ? selectedTop.name[language] : 'Drop 01 Hoodie'}</span>
                <span className="font-bold">{selectedSize}</span>
              </div>
            </div>

            {/* Customization & Configuration Options */}
            <div className="md:col-span-6 space-y-6">
              {/* Product Layer Selection */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] tracking-wider block uppercase">
                  {isArabic ? '1. اختر القطعة الأساسية:' : '1. Select Main Outerpiece:'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTop(p)}
                      className={`p-3 border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedTop?.id === p.id
                          ? 'border-[#D8A065] bg-[#D8A065]/15 text-[#D8A065] font-bold'
                          : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#D8A065]" />
                        <span className="font-body text-xs sm:text-sm">{p.name[language]}</span>
                      </div>
                      <span className="font-mono text-xs">{p.priceEGP.toLocaleString()} EGP</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] tracking-wider block uppercase">
                  {isArabic ? '2. اختيار المقاس الأرشيفي:' : '2. Select Oversized Cut Size:'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as GarmentSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-heading font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#D8A065] text-[#0D1929] border-[#D8A065]'
                          : 'bg-[#0D1929] text-[#E2E6E8] border-[#E2E6E8]/20 hover:border-[#D8A065]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bespoke Gold Thread Embroidery Toggle */}
              <div className="p-4 border border-[#D8A065]/40 bg-[#132238]/50 space-y-2">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeMonogram}
                      onChange={(e) => setIncludeMonogram(e.target.checked)}
                      className="accent-[#D8A065] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider">
                      {isArabic ? 'إضافة تطريز أحرف ذهبي (+٣٥٠ ج.م)' : 'ADD BESPOKE GOLD EMBROIDERY (+350 EGP)'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#D8A065] font-bold">+350 EGP</span>
                </label>
                <p className="text-[11px] text-[#E2E6E8]/70 font-body">
                  {isArabic
                    ? 'تطريز بخيوط ذهبية مطفية على الصدر المعماري بأيدي حرفيين مصريين.'
                    : 'Crafted with matte metallic gold yarn stitched by master Cairo artisans.'}
                </p>
              </div>

              {/* Price Breakdown & CTA */}
              <div className="pt-4 border-t border-[#E2E6E8]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs text-[#E2E6E8]/70 uppercase">
                    {isArabic ? 'إجمالي الإطلالة المنسقة:' : 'OUTFIT TOTAL:'}
                  </span>
                  <span className="font-heading text-2xl text-[#D8A065]">
                    {totalPrice.toLocaleString()} EGP
                  </span>
                </div>

                <button
                  onClick={handleAddOutfit}
                  className="w-full btn-lahab-primary py-4 text-xs font-heading font-bold flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isArabic ? 'إضافة الإطلالة بالكامل للسلة' : 'ADD COMPLETE OUTFIT TO BAG'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OutfitLayeringStudioModal;
