/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { ProductItem, CartItem, GarmentSize, WishlistItem, MonogramCustomization, ProductId, Theme, ProductReview } from './types';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SizeGuideModal from './components/SizeGuideModal';
import SmartFitVisualizerModal from './components/SmartFitVisualizerModal';
import MonogramPersonalizerModal from './components/MonogramPersonalizerModal';
import CheckoutReservationModal from './components/CheckoutReservationModal';
import MyOrdersModal from './components/MyOrdersModal';
import OutfitLayeringStudioModal from './components/OutfitLayeringStudioModal';
import CurrencyShippingModal from './components/CurrencyShippingModal';
import FlameMedallionLoader from './components/FlameMedallionLoader';
import Wordmark from './components/Wordmark';
import FlameCursor from './components/FlameCursor';
import { translations, Language } from './translations';
import PageRenderer from './pageBuilder/PageRenderer';
import LegacyStorefrontPage from './pageBuilder/LegacyStorefrontPage';
import type { StorefrontContext } from './pageBuilder/StorefrontContext';
import type { PageDocument } from '../shared/pageSchema';
import { validatePageDocument } from '../shared/pageSchemaValidation';
import {
  getProducts,
  getReviews,
  getCart,
  addToCartApi,
  updateCartQuantityApi,
  clearCartApi,
  getWishlist,
  addToWishlistApi,
  removeFromWishlistApi,
  getPublishedPage,
} from './lib/api';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  // Theme State: 'navy' (nocturnal navy) | 'desert' (desert sand) with localStorage persistence.
  // (This is a lightweight UI preference, not customer data, so it stays client-side.)
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('lahab_theme');
      if (stored === 'desert' || stored === 'navy') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'navy';
  });

  // Sync theme attribute to <html> and <body> elements and persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'desert') {
      document.documentElement.classList.add('theme-desert');
      document.body.classList.add('theme-desert');
    } else {
      document.documentElement.classList.remove('theme-desert');
      document.body.classList.remove('theme-desert');
    }
    try {
      localStorage.setItem('lahab_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // BUG FIX: products used to be a hardcoded array baked into the frontend bundle.
  // They now come from the real server database (/api/products), which is what
  // the new admin panel (/admin) reads from and writes to.
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  // BUG FIX: this used to silently substitute a hardcoded, stale fake catalog
  // (different prices than the real database!) whenever the API failed, and
  // separately merged in per-browser localStorage "admin edits" that could
  // permanently override real database values on just one browser - neither
  // of which the merchant or other customers would ever see. Now a load
  // failure is shown honestly instead of quietly serving fabricated data.
  const [productsError, setProductsError] = useState(false);

  // BUG FIX: reviews used to live only in each visitor's own localStorage. They now
  // come from the shared server database so every visitor sees the same reviews.
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [publishedPage, setPublishedPage] = useState<PageDocument | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [viewerProductId, setViewerProductId] = useState<ProductId>();

  const refreshReviews = useCallback(() => {
    getReviews()
      .then(setReviews)
      .catch(() => {
        /* non-critical */
      });
  }, []);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    setProductsError(false);
    getProducts()
      .then((list) => setProducts(list))
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
    refreshReviews();
  }, [loadProducts, refreshReviews]);

  useEffect(() => {
    let active = true;
    getPublishedPage('home')
      .then(({ page }) => {
        if (!active) return;
        const validation = validatePageDocument(page);
        if (validation.valid) setPublishedPage(page as PageDocument);
        else console.warn('[LAHAB Storefront] Published page validation failed; using legacy composition.', validation.errors);
      })
      .catch((error) => {
        console.warn('[LAHAB Storefront] Published page unavailable; using legacy composition.', error);
      })
      .finally(() => {
        if (active) setPageLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Handle URL hash scrolling (e.g. #authenticity, #lookbook) when page finishes loading or hash changes
  useEffect(() => {
    if (productsLoading || pageLoading) return;
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pageLoading, productsLoading]);

  // BUG FIX: cart used to live only in local React state (lost on refresh) and
  // wishlist used to live in browser localStorage (per-browser, not shared across
  // devices). Both are now persisted server-side, keyed by an anonymous device
  // cookie the server assigns automatically - see server/deviceId.ts.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    getCart()
      .then(setCartItems)
      .catch(() => setCartItems([]));
    getWishlist()
      .then(setSavedItems)
      .catch(() => setSavedItems([]));
  }, []);

  // Modals and Drawers Visibility States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSizingOpen, setIsSizingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isFitVisualizerOpen, setIsFitVisualizerOpen] = useState(false);
  const [isMonogramOpen, setIsMonogramOpen] = useState(false);
  const [isOutfitStudioOpen, setIsOutfitStudioOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [monogramProduct, setMonogramProduct] = useState<ProductItem | null>(null);
  const [monogramSize, setMonogramSize] = useState<GarmentSize>('L');

  // Reviews target filter state
  const [reviewsProductId, setReviewsProductId] = useState<ProductId | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll Progress Tracking for the top visual gold progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Sync document direction and language when language state changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];
  const isArabic = language === 'ar';
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'navy' ? 'desert' : 'navy'));
  };

  const handleAddToCart = (
    product: ProductItem,
    size: GarmentSize,
    monogram?: MonogramCustomization
  ) => {
    addToCartApi(product.id, size, monogram)
      .then(setCartItems)
      .catch(() => {
        setToastMessage(isArabic ? 'تعذّرت إضافة القطعة للسلة' : 'Could not add item to bag');
        setTimeout(() => setToastMessage(null), 3000);
      });

    const msg = isArabic
      ? `تمت إضافة: ${product.name.ar} (مقاس ${size})${monogram ? ' مع تطريز مخصص' : ''}`
      : `ADDED: ${product.name.en} (SIZE ${size})${monogram ? ' WITH MONOGRAM' : ''}`;

    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleUpdateQuantity = (id: string, size: string, delta: number) => {
    const item = cartItems.find((i) => i.product.id === id && i.size === size);
    if (!item?.id) return;
    updateCartQuantityApi(item.id, delta)
      .then(setCartItems)
      .catch(() => {
        /* non-critical */
      });
  };

  const handleToggleSave = (productId: ProductId, size: GarmentSize) => {
    const exists = savedItems.some((item) => item.productId === productId);
    if (exists) {
      removeFromWishlistApi(productId)
        .then(setSavedItems)
        .catch(() => {
          /* non-critical */
        });
      setToastMessage(isArabic ? 'تمت إزالة القطعة من المفضلة' : 'Piece removed from saved list');
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      addToWishlistApi(productId, size)
        .then(setSavedItems)
        .catch(() => {
          /* non-critical */
        });
      setToastMessage(isArabic ? 'تم حفظ القطعة في قائمتك المفضلة' : 'Piece saved to your private wishlist');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleRemoveSavedItem = (productId: string, _size: GarmentSize) => {
    removeFromWishlistApi(productId)
      .then(setSavedItems)
      .catch(() => {
        /* non-critical */
      });
  };

  const handleOpenMonogramModal = (product: ProductItem, size: GarmentSize) => {
    setMonogramProduct(product);
    setMonogramSize(size);
    setIsMonogramOpen(true);
  };

  const handleOpenReviews = (productId: ProductId) => {
    setReviewsProductId(productId);
    const el = document.getElementById('reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyMonogram = (customization: MonogramCustomization) => {
    if (!monogramProduct) return;
    handleAddToCart(monogramProduct, monogramSize, customization);
    setIsMonogramOpen(false);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectViewerProduct = (productId: ProductId, scroll = false) => {
    setViewerProductId(productId);
    if (scroll) {
      requestAnimationFrame(() => {
        document.getElementById('drape-360')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const storefrontContext: StorefrontContext = {
    products,
    reviews,
    language,
    isArabic,
    theme,
    currency: selectedCurrency,
    translations: t,
    selectedReviewsProductId: reviewsProductId,
    selectedViewerProductId: viewerProductId,
    savedProductIds: savedItems.map((item) => item.productId),
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleSave,
    onOpenMonogram: handleOpenMonogramModal,
    onOpenFitVisualizer: () => setIsFitVisualizerOpen(true),
    onOpenReviews: handleOpenReviews,
    onSelectViewerProduct: handleSelectViewerProduct,
    onOpenSizeGuide: () => setIsSizingOpen(true),
    onReviewsChanged: refreshReviews,
    onScrollToProducts: handleScrollToProducts,
    onShopLook: (productId, size) => {
      const product = products.find((item) => item.id === productId);
      if (product) handleAddToCart(product, size);
    },
  };

  if (productsLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#0D1929] flex items-center justify-center">
        <Wordmark size="md" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-[#0D1929] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Wordmark size="md" />
        <p className="text-sm text-[#E2E6E8]/70 max-w-sm">
          {isArabic
            ? 'تعذّر تحميل المنتجات حاليًا. يرجى المحاولة تاني بعد لحظات.'
            : "We couldn't load the collection right now. Please try again in a moment."}
        </p>
        <button onClick={loadProducts} className="btn-lahab-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
          {isArabic ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`storefront-shell min-h-screen bg-[#0D1929] text-[#E2E6E8] flex flex-col font-body selection:bg-[#D8A065] selection:text-[#0D1929] transition-all ${
        totalCartCount > 0 ? 'pb-20 lg:pb-0' : ''
      }`}
    >
      {/* Interactive Flame Cursor component */}
      <FlameCursor theme={theme} />

      {/* 
        Scroll Progress Bar:
        A thin, gold progress indicator at the very top of the viewport
        that fills as the user scrolls down, providing visual depth and position.
      */}
      <motion.div
        id="scroll-progress-bar"
        className={`fixed top-0 left-0 right-0 h-[2.5px] bg-[#D8A065] z-60 shadow-[0_0_10px_rgba(216,160,101,0.7)] ${
          isArabic ? 'origin-right' : 'origin-left'
        }`}
        style={{ scaleX }}
      />

      {/* Top Fixed Navigation with Translation Toggle & Wishlist Counter */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSizingModal={() => setIsSizingOpen(true)}
        onOpenOutfitStudio={() => setIsOutfitStudioOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        selectedCurrency={selectedCurrency}
        wishlistCount={savedItems.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        t={t.nav}
      />

      {/* Floating Add to Bag Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#0D1929] border border-[#D8A065] text-[#D8A065] px-5 py-3 font-heading text-xs tracking-wider flex items-center gap-3 shadow-xl backdrop-blur-md"
        >
          <span className="w-2 h-2 bg-[#D8A065] animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-lahab-primary px-3 py-1 text-[11px] uppercase font-bold ml-2 cursor-pointer"
          >
            {t.nav.bag}
          </button>
        </div>
      )}

      {publishedPage ? (
        <PageRenderer page={publishedPage} context={storefrontContext} />
      ) : (
        <LegacyStorefrontPage context={storefrontContext} />
      )}

      {/* Sticky "View Bag" bar - mobile only, shown whenever the bag has items.
          Desktop already has the bag button in the navbar; this just gives
          mobile a persistent, thumb-reachable way back to checkout instead of
          having to scroll back up to the navbar. */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-[#0D1929]/95 backdrop-blur-md border-t border-[#D8A065]/30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-lahab-primary w-full py-3.5 flex items-center justify-center gap-2.5 text-sm font-bold cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isArabic ? 'عرض السلة' : 'View Bag'}</span>
            <span className="bg-[#0D1929] text-[#D8A065] px-2 py-0.5 text-xs font-mono font-bold rounded-xs">
              {totalCartCount}
            </span>
          </button>
        </div>
      )}

      {/* Feature 9: Shopping Bag Slideover Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={handleOpenCheckout}
        t={t.cart}
        language={language}
      />

      {/* Feature 9: Saved Pieces / Wishlist Slideover Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        savedItems={savedItems}
        products={products}
        onRemoveItem={handleRemoveSavedItem}
        onMoveToBag={(prod, size) => handleAddToCart(prod, size)}
        onExploreProducts={handleScrollToProducts}
        language={language}
      />

      {/* Feature 3: Contact & Allocation Reservation Modal (Egypt & GCC) */}
      <CheckoutReservationModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        language={language}
        onSuccessReset={() => {
          clearCartApi()
            .then(setCartItems)
            .catch(() => setCartItems([]));
        }}
      />

      {/* Dedicated Client Orders History Page / Modal */}
      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        language={language}
      />

      {/* Standard Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={isSizingOpen}
        onClose={() => setIsSizingOpen(false)}
        t={t.sizeModal}
        language={language}
      />

      {/* Feature 2: Interactive Smart Fit & Drape Visualizer Modal */}
      <SmartFitVisualizerModal
        isOpen={isFitVisualizerOpen}
        onClose={() => setIsFitVisualizerOpen(false)}
        language={language}
        onSelectRecommendedSize={(product, size) => {
          handleAddToCart(product, size);
          setIsFitVisualizerOpen(false);
        }}
      />

      {/* Feature 1: Monogram Personalizer Modal */}
      {monogramProduct && (
        <MonogramPersonalizerModal
          isOpen={isMonogramOpen}
          onClose={() => setIsMonogramOpen(false)}
          product={monogramProduct}
          selectedSize={monogramSize}
          language={language}
          onApplyCustomization={handleApplyMonogram}
        />
      )}

      {/* Feature 3: Interactive Outfit Layering Studio Modal */}
      <OutfitLayeringStudioModal
        isOpen={isOutfitStudioOpen}
        onClose={() => setIsOutfitStudioOpen(false)}
        products={products}
        language={language}
        onAddOutfitToBag={(items) => {
          items.forEach((item) => handleAddToCart(item.product, item.size));
        }}
      />

      {/* Feature 9: Regional Currency & Shipping Selector Modal */}
      <CurrencyShippingModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        language={language}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={(curr) => setSelectedCurrency(curr)}
      />

      {/* Feature 10: Flame Medallion Transition Loader Screen */}
      <FlameMedallionLoader />
    </div>
  );
}
