import React, { useState, useRef } from 'react';
import { ZoomIn, Bell, Share2, Copy, Check, Heart, Scissors, Ruler, Star, MessageSquare } from 'lucide-react';
import { ProductItem, GarmentSize, GarmentView, ProductId } from '../types';
import StockAlertModal from './StockAlertModal';
import { TranslationSchema, Language } from '../translations';

interface ProductCardProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem, size: GarmentSize) => void;
  onOpenMonogram?: (product: ProductItem, size: GarmentSize) => void;
  onOpenFitVisualizer?: () => void;
  onOpenReviews?: (productId: ProductId) => void;
  onEditImage?: (product: ProductItem) => void;
  isSaved?: boolean;
  onToggleSave?: (productId: ProductId, size: GarmentSize) => void;
  reviewsCount?: number;
  averageRating?: number;
  t: TranslationSchema['showcase'];
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenMonogram,
  onOpenFitVisualizer,
  onOpenReviews,
  onEditImage,
  isSaved = false,
  onToggleSave,
  reviewsCount = 0,
  averageRating = 0,
  t,
  language,
}) => {
  const [activeView, setActiveView] = useState<GarmentView>('front');
  const [showEditorial, setShowEditorial] = useState(true);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('L');
  const [isAdded, setIsAdded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [isStockAlertOpen, setIsStockAlertOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Zoom state and coordinate tracking for macro inspection
  const visualContainerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoord, setZoomCoord] = useState({ x: 50, y: 50 });

  const isArabic = language === 'ar';
  const garmentType = 'hoodie';

  // BUG FIX: this used to read a client-only localStorage cache to compute the review
  // count. Reviews now live in the real server database - the count is passed down
  // from App.tsx, which fetches all reviews once via /api/reviews.
  const productReviewsCount = reviewsCount;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!visualContainerRef.current) return;
    const rect = visualContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoord({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!visualContainerRef.current || e.touches.length === 0) return;
    const rect = visualContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomCoord({ x, y });
    setIsZoomed(true);
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="glass-card-luxury border border-[#D8A065]/40 flex flex-col justify-between card-hover-alive relative overflow-hidden group rounded-sm"
    >
      {/* Engraved Gold Accent Border Line */}
      <div className="absolute inset-1 border border-[#D8A065]/20 pointer-events-none z-10" />
      {/* Product Card Top Bar */}
      <div className="p-4 sm:p-6 border-b border-[#E2E6E8]/20 bg-[#132238]/40 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="font-heading text-xs tracking-widest text-[#D8A065] block">
              {product.code}
            </span>
            <h3 className="font-heading text-lg sm:text-2xl text-[#D8A065] tracking-wide leading-tight mt-1 text-balance">
              {product.name[language]}
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right">
              <span className="font-heading text-base sm:text-xl text-[#E2E6E8] whitespace-nowrap">
                {isArabic
                  ? `${product.priceEGP.toLocaleString('ar-EG')} ج.م`
                  : `${product.priceEGP.toLocaleString()} EGP`}
              </span>
            </div>
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(product.id, selectedSize)}
                className={`p-2 border transition-all cursor-pointer ${
                  isSaved
                    ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929]'
                    : 'border-[#E2E6E8]/30 bg-[#0D1929] text-[#E2E6E8]/70 hover:text-[#D8A065] hover:border-[#D8A065]'
                }`}
                title={isArabic ? 'حفظ في المفضلة' : 'Save piece to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Small, pill-shaped tags highlighting unique garment properties */}
        {product.tags && product.tags[language] && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {product.tags[language].map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-medium tracking-wider uppercase border border-[#D8A065]/40 bg-[#0D1929]/90 text-[#E2E6E8] shadow-sm backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A065]" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Customer Star Rating & Reviews Direct Trigger */}
        <div
          onClick={() => {
            const el = document.getElementById('reviews');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            onOpenReviews?.(product.id);
          }}
          className="pt-1 flex flex-wrap items-center justify-between gap-2 cursor-pointer group select-none"
          title={isArabic ? 'عرض تقييمات وآراء العملاء' : 'View customer star reviews & comments'}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-[#D8A065]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(averageRating)
                      ? 'fill-[#D8A065] text-[#D8A065]'
                      : 'text-[#E2E6E8]/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-[#E2E6E8] group-hover:text-[#D8A065] transition-colors">
              {productReviewsCount > 0 ? `${averageRating.toFixed(1)} / 5.0` : (isArabic ? 'إصدار جديد' : 'NEW DROP')}
            </span>
          </div>

          <span className="font-mono text-[11px] text-[#D8A065] underline decoration-dotted group-hover:text-[#E2E6E8] transition-colors">
            {productReviewsCount > 0
              ? (isArabic
                  ? `${productReviewsCount} تقييم موثق ↗`
                  : `${productReviewsCount} Verified ${productReviewsCount === 1 ? 'Review' : 'Reviews'} ↗`)
              : (isArabic ? 'آراء العملاء والتقييم ↗' : 'Collector Reviews ↗')}
          </span>
        </div>
      </div>

      {/* Visual Garment Display Area with Interactive Hover-to-Zoom */}
      <div
        ref={visualContainerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsZoomed(false)}
        className="relative bg-[#0D1929] border-b border-[#E2E6E8]/20 group overflow-hidden select-none cursor-crosshair"
      >
        {/* Scalable Garment / Editorial Photo Viewport */}
        <div
          style={{
            transformOrigin: `${zoomCoord.x}% ${zoomCoord.y}%`,
            transform: isZoomed ? 'scale(2.3)' : 'scale(1)',
            transition: isZoomed ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out',
          }}
          className="w-full aspect-4/5 overflow-hidden"
        >
          {showEditorial || !product.editorialImage ? (
            <div className="relative w-full h-full bg-[#0D1929]">
              <img
                src={product.editorialImage}
                alt={product.name[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-transparent to-transparent opacity-60" />
            </div>
          ) : activeView === 'back' ? (
            <div className="relative w-full h-full bg-[#0B1524] flex items-center justify-center">
              <img
                src={product.editorialImage}
                alt={`${product.name[language]} - Back Silhouette`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-110 brightness-95 scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-transparent to-transparent opacity-70" />
              <div className="absolute top-4 left-4 border border-[#D8A065]/60 bg-[#0D1929]/90 px-2.5 py-1 text-[10px] font-heading text-[#D8A065] tracking-widest uppercase">
                {isArabic ? 'المنظور الخلفي' : 'BACK VIEW ARCHIVE'}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-[#0D1929]">
              <img
                src={product.editorialImage}
                alt={`${product.name[language]} - Front View`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4 border border-[#D8A065]/60 bg-[#0D1929]/90 px-2.5 py-1 text-[10px] font-heading text-[#D8A065] tracking-widest uppercase">
                {isArabic ? 'المنظور الأمامي' : 'FRONT VIEW ARCHIVE'}
              </div>
            </div>
          )}
        </div>

        {/* Hover-to-Zoom Inspection Indicator Reticle & Floating HD Circular Lens Overlay */}
        {isZoomed && (
          <div
            className="pointer-events-none absolute w-36 h-36 rounded-full border-2 border-[#D8A065] shadow-[0_0_25px_rgba(216,160,101,0.6),inset_0_0_15px_rgba(0,0,0,0.5)] z-40 overflow-hidden -translate-x-1/2 -translate-y-1/2 hidden sm:block"
            style={{
              left: `${zoomCoord.x}%`,
              top: `${zoomCoord.y}%`,
            }}
          >
            <div
              className="w-full h-full bg-[#0D1929] bg-no-repeat"
              style={{
                backgroundImage: `url(${product.editorialImage})`,
                backgroundPosition: `${zoomCoord.x}% ${zoomCoord.y}%`,
                backgroundSize: '350%',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.5))] pointer-events-none" />
            <div className="absolute bottom-1.5 inset-x-0 text-center font-mono text-[8px] font-bold text-[#D8A065] bg-[#0D1929]/90 py-0.5 tracking-tighter uppercase border-t border-[#D8A065]/40">
              520 GSM GIZA 86 // MACRO
            </div>
          </div>
        )}

        <div
          className={`pointer-events-none absolute bottom-12 inset-x-4 flex justify-center transition-all duration-300 z-20 ${
            isZoomed
              ? 'opacity-100 translate-y-0'
              : 'opacity-70 group-hover:opacity-100 translate-y-1'
          }`}
        >
          <div className="bg-[#0D1929]/95 backdrop-blur-md border border-[#D8A065]/70 px-3 py-1 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[#D8A065] shadow-lg">
            <ZoomIn className={`w-3.5 h-3.5 text-[#D8A065] ${isZoomed ? 'animate-pulse' : ''}`} />
            <span className="tracking-wider uppercase">
              {isZoomed ? (isArabic ? 'عدسة فحص غزل القطن المجهرية 2.8X' : '2.8X HD FABRIC MACRO LENS') : t.hoverToZoom}
            </span>
            {isZoomed && (
              <span className="text-[#E2E6E8]/70 border-l border-[#D8A065]/40 pl-2 rtl:border-l-0 rtl:border-r rtl:pr-2">
                {Math.round(zoomCoord.x)}% : {Math.round(zoomCoord.y)}%
              </span>
            )}
          </div>
        </div>

        {/* View Switcher Overlay: Front / Back / Editorial Look & Direct Admin Image Edit */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-30">
          <div className="pointer-events-auto flex items-center border border-[#E2E6E8]/40 bg-[#0D1929]/90 backdrop-blur-md">
            <button
              onClick={() => {
                setShowEditorial(false);
                setActiveView('front');
              }}
              className={`px-3 py-1.5 font-heading text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                !showEditorial && activeView === 'front'
                  ? 'bg-[#D8A065] text-[#0D1929]'
                  : 'text-[#E2E6E8] hover:text-[#D8A065]'
              }`}
            >
              {t.frontView}
            </button>
            <button
              onClick={() => {
                setShowEditorial(false);
                setActiveView('back');
              }}
              className={`px-3 py-1.5 font-heading text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                !showEditorial && activeView === 'back'
                  ? 'bg-[#D8A065] text-[#0D1929]'
                  : 'text-[#E2E6E8] hover:text-[#D8A065]'
              }`}
            >
              {t.backView}
            </button>
            {product.editorialImage && (
              <button
                onClick={() => setShowEditorial(true)}
                className={`px-3 py-1.5 font-heading text-xs tracking-wider uppercase transition-colors cursor-pointer border-l border-[#E2E6E8]/40 ${
                  showEditorial
                    ? 'bg-[#D8A065] text-[#0D1929]'
                    : 'text-[#E2E6E8] hover:text-[#D8A065]'
                }`}
              >
                {isArabic ? 'إطلالة حية' : 'LOOKBOOK'}
              </button>
            )}
          </div>

          {onEditImage ? (
            <button
              onClick={() => onEditImage(product)}
              className="pointer-events-auto btn-lahab-primary px-3 py-1 text-[11px] font-heading font-bold tracking-wider uppercase cursor-pointer shadow-lg"
            >
              📷 {isArabic ? 'تغيير الصورة' : 'Change Image'}
            </button>
          ) : (
            <span className="hidden sm:inline-block font-mono text-xs text-[#E2E6E8] border border-[#E2E6E8]/40 px-2.5 py-1 bg-[#0D1929]/90">
              {product.weight}
            </span>
          )}
        </div>

        {/* View Details Label at bottom of visual */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-4 flex items-center justify-between gap-2 text-xs font-body text-[#E2E6E8] z-30">
          <span className="min-w-0 truncate bg-[#0D1929]/80 backdrop-blur-sm px-2.5 py-0.5 border border-[#E2E6E8]/30">
            {showEditorial
              ? (isArabic ? 'إطلالة حية في الاستوديو' : 'EDITORIAL ON-BODY PRESENTATION')
              : activeView === 'front'
              ? product.frontDetail[language]
              : product.backDetail[language]}
          </span>
          <button
            onClick={() => setShowSpecs(!showSpecs)}
            className="shrink-0 bg-[#0D1929]/90 backdrop-blur-sm px-3 py-1 border border-[#D8A065] text-[#D8A065] font-bold cursor-pointer hover:bg-[#D8A065] hover:text-[#0D1929] transition-colors"
          >
            {showSpecs ? t.hideSpecs : t.viewSpecs}
          </button>
        </div>
      </div>

      {/* Specifications Drawer */}
      {showSpecs && (
        <div className="p-4 sm:p-6 bg-[#132238]/80 border-b border-[#E2E6E8]/20 space-y-2 text-xs font-body animate-fade-in">
          <div className="flex justify-between gap-4 py-1 border-b border-[#E2E6E8]/10">
            <span className="text-[#D8A065] font-bold">{isArabic ? 'المادة:' : 'MATERIAL:'}</span>
            <span className="text-[#E2E6E8] text-right">{product.material[language]}</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-[#E2E6E8]/10">
            <span className="text-[#D8A065] font-bold">{isArabic ? 'الوزن النسيجي:' : 'WEIGHT:'}</span>
            <span className="text-[#E2E6E8]">{product.weight}</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-[#E2E6E8]/10">
            <span className="text-[#D8A065] font-bold">{isArabic ? 'القالب والقصة:' : 'SILHOUETTE:'}</span>
            <span className="text-[#E2E6E8] text-right">{product.fit[language]}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-[#D8A065] font-bold">{isArabic ? 'العناية:' : 'CARE:'}</span>
            <span className="text-[#E2E6E8] text-right">
              {isArabic ? 'غسيل آلي بماء بارد ومقلوبًا، تجفيف بالتعليق' : 'Machine wash cold inside out, hang dry'}
            </span>
          </div>
        </div>
      )}

      {/* Product Details & Selection Bar */}
      <div className="p-4 sm:p-6 space-y-5 bg-[#0D1929]">
        <p className="font-body text-xs sm:text-sm text-[#E2E6E8] leading-relaxed opacity-90">
          {product.description[language]}
        </p>

        {/* Size Selector */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-2">
            <span className="font-heading text-xs text-[#D8A065] tracking-wider">
              {t.selectSize}
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {onOpenFitVisualizer && (
                <button
                  type="button"
                  onClick={onOpenFitVisualizer}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D8A065] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3 h-3" />
                  <span>{isArabic ? 'حاسبة المقاس' : 'Fit Visualizer'}</span>
                </button>
              )}
              <span className="font-body text-xs text-[#E2E6E8]/70">
                {t.fitNotice}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((sz) => {
              const isOutOfStock = product.outOfStockSizes?.includes(sz);
              const isSelected = selectedSize === sz;

              return (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`relative py-2 text-xs font-bold font-heading transition-all cursor-pointer border ${
                    isSelected
                      ? isOutOfStock
                        ? 'bg-[#D8A065]/20 text-[#D8A065] border-[#D8A065]'
                        : 'bg-[#D8A065] text-[#0D1929] border-[#D8A065] shadow-sm'
                      : isOutOfStock
                      ? 'bg-[#132238]/60 text-[#E2E6E8]/50 border-[#E2E6E8]/20 hover:border-[#D8A065]/60'
                      : 'bg-[#0D1929] text-[#E2E6E8] border-[#E2E6E8]/30 hover:border-[#D8A065]'
                  }`}
                >
                  <span>{sz}</span>
                  {isOutOfStock && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8A065] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D8A065]"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Dynamic Switch between Add to Bag and 'Email Me When Available' for Sold Out Sizes */}
        {product.outOfStockSizes?.includes(selectedSize) ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-body text-[#D8A065] bg-[#D8A065]/10 border border-[#D8A065]/35 px-3 py-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Bell className="w-3.5 h-3.5 text-[#D8A065] shrink-0" />
                <span>{t.sizeSoldOutNotice}</span>
              </span>
            </div>

            <button
              onClick={() => setIsStockAlertOpen(true)}
              className="w-full py-4 px-6 text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer border border-[#D8A065] bg-[#D8A065] text-[#0D1929] hover:bg-[#D8A065]/90 transition-all font-heading font-bold tracking-wider uppercase shadow-md active:scale-[0.99]"
            >
              <Bell className="w-4 h-4" />
              <span>
                {t.emailWhenAvailable} ({selectedSize})
              </span>
              <span className="font-mono font-bold">{isArabic ? '←' : '→'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full btn-lahab-primary py-4 px-6 text-sm flex items-center justify-center gap-3 cursor-pointer"
          >
            {isAdded ? (
              <span className="font-bold">
                ✓ {t.addedToBag} ({selectedSize})
              </span>
            ) : (
              <>
                <span>
                  {t.addToBag} —{' '}
                  {isArabic
                    ? `${product.priceEGP.toLocaleString('ar-EG')} ج.م`
                    : `${product.priceEGP.toLocaleString()} EGP`}
                </span>
                <span className="font-mono font-bold">{isArabic ? '←' : '→'}</span>
              </>
            )}
          </button>
        )}

        {/* Bespoke Monogram Customizer Button */}
        {onOpenMonogram && (
          <button
            type="button"
            onClick={() => onOpenMonogram(product, selectedSize)}
            className="w-full py-2.5 px-4 text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer border border-[#D8A065]/60 bg-[#132238]/60 text-[#D8A065] hover:bg-[#D8A065] hover:text-[#0D1929] transition-all tracking-wider uppercase"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {isArabic
                ? 'تخصيص تطريز بالخيط الذهبي (+٣٥٠ ج.م)'
                : 'BESPOKE GOLD MONOGRAM EMBROIDERY (+350 EGP)'}
            </span>
          </button>
        )}

        {/* Client Reviews & Comments Button */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('reviews');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            onOpenReviews?.(product.id);
          }}
          className="w-full py-2.5 px-4 text-xs font-heading font-bold flex items-center justify-center gap-2 cursor-pointer border border-[#E2E6E8]/20 bg-[#0D1929] text-[#E2E6E8]/80 hover:border-[#D8A065] hover:text-[#D8A065] transition-all tracking-wider uppercase"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#D8A065]" />
          <span>
            {isArabic
              ? `تقييمات العملاء والتعليقات${productReviewsCount > 0 ? ` (★ ${averageRating.toFixed(1)})` : ''}`
              : `CLIENT REVIEWS & COMMENTS${productReviewsCount > 0 ? ` (★ ${averageRating.toFixed(1)})` : ''}`}
          </span>
        </button>

        {/* Social Sharing Bar: Twitter/X, WhatsApp & Copy Link */}
        <div className="pt-3 border-t border-[#E2E6E8]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-body text-[#E2E6E8]/80">
          <div className="flex items-center gap-1.5 text-[#D8A065] font-heading text-[10px] tracking-wider uppercase">
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.sharePiece}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${
                  isArabic
                    ? `اكتشف ${product.name.ar} من إصدار لَهَب الأول (Drop 01) — قطن مصري فاخر وتطريز خيوط ذهبية:`
                    : `Discover the ${product.name.en} from LAHAB Drop 01 — 100% Egyptian Cotton & Gold Thread Embroidery:`
                }\n${typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''}#product-card-${product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title={t.shareWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E2E6E8]/20 bg-[#132238]/50 hover:border-[#D8A065] hover:text-[#D8A065] transition-colors cursor-pointer text-xs font-heading"
            >
              <span className="text-[#25D366] font-bold text-[11px]">WA</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Twitter/X Share Button */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                isArabic
                  ? `اكتشف ${product.name.ar} من إصدار لَهَب الأول @LAHAB_STREETWEAR`
                  : `Discover the ${product.name.en} from @LAHAB_STREETWEAR Drop 01`
              )}&url=${encodeURIComponent(
                `${typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''}#product-card-${product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title={t.shareTwitter}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E2E6E8]/20 bg-[#132238]/50 hover:border-[#D8A065] hover:text-[#D8A065] transition-colors cursor-pointer text-xs font-heading"
            >
              <span className="font-bold text-[11px]">𝕏</span>
              <span className="hidden sm:inline">Twitter</span>
            </a>

            {/* Copy Link Button */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && navigator.clipboard) {
                  const url = `${window.location.href.split('#')[0]}#product-card-${product.id}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }
              }}
              title={t.copyLink}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all cursor-pointer text-xs font-heading ${
                copiedLink
                  ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929]'
                  : 'border-[#E2E6E8]/20 bg-[#132238]/50 text-[#E2E6E8]/80 hover:border-[#D8A065] hover:text-[#D8A065]'
              }`}
            >
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px] tracking-wider uppercase">
                {copiedLink ? t.linkCopied : t.copyLink}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Out-of-Stock Notification Sign-Up Modal */}
      <StockAlertModal
        isOpen={isStockAlertOpen}
        onClose={() => setIsStockAlertOpen(false)}
        product={product}
        initialSize={selectedSize}
        language={language}
      />
    </div>
  );
};
export default ProductCard;
