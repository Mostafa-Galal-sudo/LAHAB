import React from 'react';
import HeroSection from '../components/HeroSection';
import BrandStory from '../components/BrandStory';
import ProductShowcase from '../components/ProductShowcase';
import Garment360Viewer from '../components/Garment360Viewer';
import ProductReviewsSection from '../components/ProductReviewsSection';
import StreetStyleLookbook from '../components/StreetStyleLookbook';
import SerialVerifier from '../components/SerialVerifier';
import FaqSection from '../components/FaqSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import type { StorefrontContext } from './StorefrontContext';

interface LegacyStorefrontPageProps {
  context: StorefrontContext;
}

/** Temporary Phase 2 fallback retaining the pre-schema composition. */
const LegacyStorefrontPage: React.FC<LegacyStorefrontPageProps> = ({ context }) => {
  const t = context.translations;

  return (
    <div data-page-renderer="legacy" style={{ display: 'contents' }}>
      <HeroSection onExploreClick={context.onScrollToProducts} t={t.hero} isArabic={context.isArabic} />
      <BrandStory t={t.story} isArabic={context.isArabic} />
      <ProductShowcase
        products={context.products}
        reviews={context.reviews}
        onAddToCart={context.onAddToCart}
        onOpenMonogram={context.onOpenMonogram}
        onOpenFitVisualizer={context.onOpenFitVisualizer}
        onOpenReviews={context.onOpenReviews}
        savedProductIds={context.savedProductIds}
        onToggleSave={context.onToggleWishlist}
        t={t.showcase}
        language={context.language}
      />
      <Garment360Viewer products={context.products} language={context.language} theme={context.theme} />
      <ProductReviewsSection
        products={context.products}
        reviews={context.reviews}
        onReviewsChanged={context.onReviewsChanged}
        language={context.language}
        selectedProductId={context.selectedReviewsProductId}
      />
      <StreetStyleLookbook language={context.language} onShopLook={context.onShopLook} />
      <SerialVerifier language={context.language} />
      <FaqSection t={t.faq} language={context.language} />
      <ContactSection language={context.language} />
      <Footer t={t.footer} />
    </div>
  );
};

export default LegacyStorefrontPage;
