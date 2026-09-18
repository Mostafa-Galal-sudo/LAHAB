import React, { useState } from 'react';
import { Heart, Sun, Moon, Package, Menu, X, ShoppingBag } from 'lucide-react';
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
  // BUG FIX: nav links were `hidden lg:flex` with no mobile equivalent at
  // all - on any screen under 1024px (i.e. every phone) they simply
  // disappeared with no way to reach Products, Reviews, Contact, etc.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#products', label: t.pieces, emphasized: true, icon: ShoppingBag },
    { href: '#drape-360', label: isArabic ? 'عرض ٣٦٠°' : '360° DRAPE' },
    { href: '#lookbook', label: isArabic ? 'إطلالات الشارع' : 'LOOKBOOK' },
    { href: '#authenticity', label: isArabic ? 'التحقق من القطع' : 'VERIFIER' },
    { href: '#vault', label: isArabic ? 'الخزينة // DROP 02' : 'VAULT' },
    { href: '#reviews', label: isArabic ? 'التقييمات' : 'REVIEWS' },
    { href: '#contact', label: isArabic ? 'تواصل معنا' : 'CONTACT', highlighted: true },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      id="main-nav"
      className="fixed top-0 inset-x-0 z-50 bg-[#0D1929]/95 backdrop-blur-md border-b border-[#E2E6E8]/20 px-3 sm:px-8 lg:px-12 h-16 sm:h-18 flex items-center justify-between gap-2 select-none transition-colors"
    >
      {/* Left: Brand Wordmark */}
      <a href="#hero" className="flex items-center gap-3 group shrink-0">
        <Wordmark size="sm" showMedallion={true} />
      </a>

      {/* Center: Nav links (Desktop) strictly translated */}
      <div className="hidden lg:flex items-center gap-6 font-heading text-xs tracking-widest text-[#E2E6E8]">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`hover:text-[#D8A065] transition-colors tracking-widest ${
              link.highlighted ? 'text-[#D8A065]' : ''
            }`}
          >
            {link.label}
          </a>
        ))}
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

      {/* Right Controls: Mobile Menu Toggle, Theme Switcher, Wishlist, Language Button, Currency, Bag */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Mobile Menu Toggle - only shown below the lg breakpoint where the
            center nav links are hidden */}
        <button
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          className="lg:hidden p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065]/60 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Theme Switcher Button */}
        <button
          id="theme-switcher-toggle"
          onClick={onToggleTheme}
          aria-label={t.themeToggleAlt}
          title={isDesert ? `${t.themeToggleNavy} (Dark)` : `${t.themeToggleDesert} (Light)`}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border border-[#D8A065]/60 hover:border-[#D8A065] bg-[#0D1929] hover:bg-[#D8A065]/10 text-[#D8A065] transition-all cursor-pointer select-none active:scale-95 group"
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
            className="hidden sm:inline-flex p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065]/60 transition-colors relative cursor-pointer"
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
            className="hidden sm:inline-flex p-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065]/60 transition-colors cursor-pointer"
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
          className="relative flex items-center gap-1.5 sm:gap-2 border border-[#D8A065] px-2 sm:px-3 py-1.5 text-xs font-heading tracking-wider text-[#D8A065] bg-[#0D1929] hover:bg-[#D8A065] hover:text-[#0D1929] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8A065] group-hover:bg-[#0D1929]" />
          <span className="font-bold text-[11px] sm:hidden">{language === 'en' ? 'AR' : 'EN'}</span>
          <span className="hidden sm:inline font-bold text-xs">{language === 'en' ? 'العربية // AR' : 'ENGLISH // EN'}</span>
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
          className="btn-lahab-primary px-2.5 sm:px-4 py-2 text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-4 h-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline font-heading font-bold">{t.bag}</span>
          <span className="bg-[#0D1929] text-[#D8A065] px-1.5 py-0.2 text-[11px] font-mono font-bold rounded-xs">
            {cartCount}
          </span>
        </button>
      </div>

      {/* Mobile Menu Panel - shows the same links the desktop bar hides below lg.
          "Pieces/Shop" is pinned first and visually emphasized so reaching the
          product grid is one tap away instead of a long scroll. */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-[#0D1929] border-b border-[#E2E6E8]/20 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="flex flex-col divide-y divide-[#E2E6E8]/10">
            <div className="sm:hidden grid grid-cols-2 gap-2 p-3 border-b border-[#E2E6E8]/10">
              <button onClick={onToggleTheme} className="mobile-nav-action">
                {isDesert ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{isArabic ? 'المظهر' : 'Theme'}</span>
              </button>
              {onOpenWishlist && (
                <button onClick={() => { onOpenWishlist(); closeMobileMenu(); }} className="mobile-nav-action">
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-current' : ''}`} />
                  <span>{isArabic ? 'المحفوظات' : 'Saved'}</span>
                </button>
              )}
              {onOpenOrders && (
                <button onClick={() => { onOpenOrders(); closeMobileMenu(); }} className="mobile-nav-action">
                  <Package className="w-4 h-4" />
                  <span>{isArabic ? 'طلباتي' : 'Orders'}</span>
                </button>
              )}
              {onOpenCurrencyModal && (
                <button onClick={() => { onOpenCurrencyModal(); closeMobileMenu(); }} className="mobile-nav-action">
                  <span className="font-mono text-[10px] font-bold">{selectedCurrency}</span>
                  <span>{isArabic ? 'العملة' : 'Currency'}</span>
                </button>
              )}
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-5 py-3.5 font-heading text-sm tracking-widest transition-colors ${
                    link.emphasized
                      ? 'text-[#D8A065] bg-[#D8A065]/10 font-bold'
                      : link.highlighted
                      ? 'text-[#D8A065]'
                      : 'text-[#E2E6E8] hover:bg-[#132238]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  {link.label}
                </a>
              );
            })}
            {onOpenOutfitStudio && (
              <button
                onClick={() => {
                  onOpenOutfitStudio();
                  closeMobileMenu();
                }}
                className="text-start px-5 py-3.5 font-heading text-sm tracking-widest text-[#D8A065] font-bold hover:bg-[#132238] cursor-pointer"
              >
                {isArabic ? 'استوديو الإطلالات' : 'OUTFIT STUDIO'}
              </button>
            )}
            <button
              onClick={() => {
                onOpenSizingModal();
                closeMobileMenu();
              }}
              className="text-start px-5 py-3.5 font-heading text-sm tracking-widest text-[#E2E6E8] hover:bg-[#132238] cursor-pointer"
            >
              {t.sizeGuide}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
