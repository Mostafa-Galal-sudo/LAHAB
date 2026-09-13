import React from 'react';
import { Heart, Sun, Moon, Package } from 'lucide-react';
import Wordmark from './Wordmark';
import { TranslationSchema, Language } from '../translations';
import { Theme } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSizingModal: () => void;
  onOpenOutfitStudio?: () => void;
  onOpenCurrencyModal?: () => void;
  onOpenOrders?: () => void;
  selectedCurrency?: string;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  t: TranslationSchema['nav'];
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenSizingModal,
  onOpenOutfitStudio,
  onOpenCurrencyModal,
  onOpenOrders,
  selectedCurrency = 'EGP',
  wishlistCount = 0,
  onOpenWishlist,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  t,
}) => {
  const isArabic = language === 'ar';
  const isDesert = theme === 'desert';

  return (
    <nav
      id="main-nav"
      className="fixed top-0 inset-x-0 z-50 bg-[#0D1929]/95 backdrop-blur-md border-b border-[#E2E6E8]/20 px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between select-none transition-colors"
    >
      {/* Left: Brand Wordmark */}
      <a href="#hero" className="flex items-center gap-3 group">
        <Wordmark size="sm" showMedallion={true} />
      </a>

      {/* Center: Nav links (Desktop) strictly translated */}
      <div className="hidden lg:flex items-center gap-6 font-heading text-xs tracking-widest text-[#E2E6E8]">
        <a
          href="#products"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {t.pieces}
        </a>
        <a
          href="#drape-360"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {isArabic ? 'عرض ٣٦٠°' : '360° DRAPE'}
        </a>
        <a
          href="#lookbook"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {isArabic ? 'إطلالات الشارع' : 'LOOKBOOK'}
        </a>
        <a
          href="#authenticity"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {isArabic ? 'التحقق من القطع' : 'VERIFIER'}
        </a>
        <a
          href="#vault"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {isArabic ? 'الخزينة // DROP 02' : 'VAULT'}
        </a>
        <a
          href="#reviews"
          className="hover:text-[#D8A065] transition-colors tracking-widest"
        >
          {isArabic ? 'التقييمات' : 'REVIEWS'}
        </a>
        <a
          href="#contact"
          className="hover:text-[#D8A065] transition-colors tracking-widest text-[#D8A065]"
        >
          {isArabic ? 'تواصل معنا' : 'CONTACT'}
        </a>
        {onOpenOutfitStudio && (
          <button
            onClick={onOpenOutfitStudio}
            className="hover:text-[#D8A065] transition-colors cursor-pointer tracking-widest text-[#D8A065] font-bold"
          >
            {isArabic ? 'استوديو الإطلالات' : 'OUTFIT STUDIO'}
          </button>
        )}
        <button
          onClick={onOpenSizingModal}
          className="hover:text-[#D8A065] transition-colors cursor-pointer tracking-widest"
        >
          {t.sizeGuide}
        </button>
      </div>

      {/* Right Controls: Theme Switcher, Wishlist, Language Button, Currency, Bag */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Theme Switcher Button */}
        <button
          id="theme-switcher-toggle"
          onClick={onToggleTheme}
          aria-label={t.themeToggleAlt}
          title={isDesert ? `${t.themeToggleNavy} (Dark)` : `${t.themeToggleDesert} (Light)`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#D8A065]/60 hover:border-[#D8A065] bg-[#0D1929] hover:bg-[#D8A065]/10 text-[#D8A065] transition-all cursor-pointer select-none active:scale-95 group"
        >
          {isDesert ? (
            <>
              <Moon className="w-3.5 h-3.5 stroke-2 transition-transform group-hover:rotate-12" />
              <span className="hidden sm:inline font-heading text-[10px] tracking-wider font-bold">
                {isArabic ? 'ليلي' : 'NAVY'}
              </span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 stroke-2 transition-transform group-hover:rotate-45" />
              <span className="hidden sm:inline font-heading text-[10px] tracking-wider font-bold">
                {isArabic ? 'رمال' : 'DESERT'}
              </span>
            </>
          )}
        </button>

        {/* Wishlist Button */}
        {onOpenWishlist && (
          <button
            onClick={onOpenWishlist}
            className="p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065]/60 transition-colors relative cursor-pointer"
            title={isArabic ? 'القطع المحفوظة' : 'Saved Pieces'}
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#D8A065] text-[#D8A065]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#D8A065] text-[#0D1929] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
        )}

        {/* My Orders Button */}
        {onOpenOrders && (
          <button
            onClick={onOpenOrders}
            className="p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065]/60 transition-colors cursor-pointer"
            title={isArabic ? 'طلباتي ومتابعة التتبع' : 'My Orders & Tracking'}
          >
            <Package className="w-4 h-4 text-[#D8A065]" />
          </button>
        )}

        {/* Translation Button for Arabic */}
        <button
          id="lang-translation-button"
          onClick={onToggleLanguage}
          title={t.langButtonAlt}
          className="relative flex items-center gap-1.5 sm:gap-2 border border-[#D8A065] px-2.5 sm:px-3 py-1.5 text-xs font-heading tracking-wider text-[#D8A065] bg-[#0D1929] hover:bg-[#D8A065] hover:text-[#0D1929] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8A065] group-hover:bg-[#0D1929]" />
          <span className="font-bold text-[11px] sm:text-xs">
            {language === 'en' ? 'العربية // AR' : 'ENGLISH // EN'}
          </span>
        </button>

        {/* Clickable Currency Indicator & Region Selector */}
        <button
          onClick={onOpenCurrencyModal}
          className="hidden xs:inline-block border border-[#D8A065]/60 hover:border-[#D8A065] bg-[#132238]/80 hover:bg-[#D8A065] hover:text-[#0D1929] px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold text-[#D8A065] tracking-wider transition-all cursor-pointer select-none"
          title="Select Region & Currency"
        >
          {selectedCurrency} ↗
        </button>

        {/* Styled Bag Button */}
        <button
          id="nav-bag-button"
          onClick={onOpenCart}
          className="btn-lahab-primary px-3 sm:px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
        >
          <span className="font-heading font-bold">{t.bag}</span>
          <span className="bg-[#0D1929] text-[#D8A065] px-1.5 py-0.2 text-[11px] font-mono font-bold rounded-xs">
            {cartCount}
          </span>
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
