import React from 'react';
import type {
  ArchivalVaultSection,
  BrandStorySection,
  CalligraphicBannerSection,
  ContactSection as ContactPageSection,
  EditorialLookbookSection,
  FaqSection as FaqPageSection,
  FooterSection as FooterPageSection,
  GarmentViewerSection,
  HeroSection as HeroPageSection,
  PageSection,
  PageSectionType,
  ProductReviewsSection as ProductReviewsPageSection,
  ProductShowcaseSection,
  SerialVerifierSection,
  StreetStyleLookbookSection,
} from '../../shared/pageSchema';
import HeroSection from '../components/HeroSection';
import CalligraphicBanner from '../components/CalligraphicBanner';
import BrandStory from '../components/BrandStory';
import EditorialLookbook from '../components/EditorialLookbook';
import ProductShowcase from '../components/ProductShowcase';
import Garment360Viewer from '../components/Garment360Viewer';
import ProductReviewsSection from '../components/ProductReviewsSection';
import StreetStyleLookbook from '../components/StreetStyleLookbook';
import SerialVerifier from '../components/SerialVerifier';
import ArchivalVaultTeaser from '../components/ArchivalVaultTeaser';
import FaqSection from '../components/FaqSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import type { StorefrontContext } from './StorefrontContext';
import { resolveAsset } from './assetResolver';
import watercolorHeroArt from '../assets/images/watercolor_hero_art_1788904793593.jpg';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';

type SectionOf<T extends PageSectionType> = Extract<PageSection, { type: T }>;
type AdapterProps<T extends PageSectionType> = { section: SectionOf<T>; context: StorefrontContext };
type SectionAdapter<T extends PageSectionType> = React.ComponentType<AdapterProps<T>>;
type SectionRegistry = { [T in PageSectionType]: SectionAdapter<T> };

const localize = (text: { en: string; ar: string }, context: StorefrontContext) => text[context.language];

const HeroSectionAdapter: SectionAdapter<'hero'> = ({ section, context }) => {
  const { content } = section;
  return (
    <HeroSection
      onExploreClick={context.onScrollToProducts}
      isArabic={context.isArabic}
      backgroundImageUrl={resolveAsset(content.backgroundImage, watercolorHeroArt)}
      t={{
        dropBadge: localize(content.badge, context),
        tagline: localize(content.tagline, context),
        subTagline: localize(content.subTagline, context),
        ctaShop: localize(content.actions[0]?.label ?? { en: 'SHOP DROP 01', ar: 'تسوق الإصدار الأول' }, context),
        ctaStory: localize(content.actions[1]?.label ?? { en: 'DISCOVER CONCEPT', ar: 'اكتشف المفهوم' }, context),
        aestheticTag: localize(content.aestheticTag, context),
        fabricTag: localize(content.fabricTag, context),
        editionLabel: localize(content.editionLabel, context),
        editionValue: localize(content.editionValue, context),
        shippingLabel: localize(content.shippingLabel, context),
        shippingValue: localize(content.shippingValue, context),
        scrollPrompt: localize(content.scrollPrompt, context),
      }}
    />
  );
};

const CalligraphicBannerAdapter: SectionAdapter<'calligraphicBanner'> = ({ section, context }) => {
  const [streetwear, tagline, origin] = section.content.items;
  return (
    <CalligraphicBanner
      content={{
        streetwear: streetwear ? localize(streetwear.text, context) : '',
        tagline: tagline ? localize(tagline.text, context) : '',
        origin: origin ? localize(origin.text, context) : '',
        showWordmark: section.content.showWordmark,
      }}
    />
  );
};

const BrandStoryAdapter: SectionAdapter<'brandStory'> = ({ section, context }) => {
  const content = section.content;
  return (
    <BrandStory
      isArabic={context.isArabic}
      visualLabel={localize(content.visualLabel, context)}
      materialTags={content.materialTags.map((tag) => localize(tag, context))}
      t={{
        badge: localize(content.badge, context),
        headline: localize(content.headline, context),
        body: localize(content.body, context),
        bodyMobile: localize(content.bodyMobile, context),
        feature1Title: localize(content.features[0]?.title ?? { en: '', ar: '' }, context),
        feature1Desc: localize(content.features[0]?.description ?? { en: '', ar: '' }, context),
        feature2Title: localize(content.features[1]?.title ?? { en: '', ar: '' }, context),
        feature2Desc: localize(content.features[1]?.description ?? { en: '', ar: '' }, context),
        feature3Title: localize(content.features[2]?.title ?? { en: '', ar: '' }, context),
        feature3Desc: localize(content.features[2]?.description ?? { en: '', ar: '' }, context),
      }}
    />
  );
};

const EditorialLookbookAdapter: SectionAdapter<'editorialLookbook'> = ({ section, context }) => {
  const legacy = context.translations.editorial;
  return (
    <EditorialLookbook
      language={context.language}
      onOpenSizingModal={context.onOpenSizeGuide}
      schemaCards={section.content.cards.map((card) => ({
        title: localize(card.title, context),
        description: localize(card.description, context),
        image: resolveAsset(card.image, streetwearEditorial),
      }))}
      t={{
        ...legacy,
        badge: localize(section.content.badge, context),
        title: localize(section.content.title, context),
        subtitle: localize(section.content.subtitle, context),
        btnMatrix: localize(section.content.cards[0]?.action?.label ?? { en: legacy.btnMatrix, ar: legacy.btnMatrix }, context),
        btnExplore: localize(section.content.cards[1]?.action?.label ?? { en: legacy.btnExplore, ar: legacy.btnExplore }, context),
      }}
    />
  );
};

const ProductShowcaseAdapter: SectionAdapter<'productShowcase'> = ({ section, context }) => {
  const products = section.content.source.kind === 'selectedProducts'
    ? context.products.filter((product) => section.content.source.productIds.includes(product.id))
    : context.products;
  return (
    <ProductShowcase
      products={products}
      reviews={context.reviews}
      onAddToCart={context.onAddToCart}
      onOpenMonogram={context.onOpenMonogram}
      onOpenFitVisualizer={context.onOpenFitVisualizer}
      onOpenReviews={context.onOpenReviews}
      onViewIn3D={(productId) => context.onSelectViewerProduct(productId, true)}
      savedProductIds={context.savedProductIds}
      onToggleSave={context.onToggleWishlist}
      language={context.language}
      t={{
        ...context.translations.showcase,
        badge: localize(section.content.badge, context),
        title: localize(section.content.title, context),
        limitedUnits: localize(section.content.limitedUnits, context),
        assuranceTitle: localize(section.content.assuranceTitle, context),
        assuranceDesc: localize(section.content.assuranceDescription, context),
      }}
    />
  );
};

const GarmentViewerAdapter: SectionAdapter<'garmentViewer'> = ({ section, context }) => {
  const products = section.content.productSource.kind === 'product'
    ? context.products.filter((product) => product.id === section.content.productSource.productId)
    : context.products;
  return (
    <Garment360Viewer
      products={products}
      language={context.language}
      theme={context.theme}
      modelUrl={resolveAsset({ assetId: section.content.model.assetId }, '/assets/models/lahab_drop01_hoodie.obj')}
      schemaContent={{
        badge: localize(section.content.badge, context),
        title: localize(section.content.title, context),
        description: localize(section.content.description, context),
        model: section.content.model,
        allowManualOrbit: section.content.allowManualOrbit,
        showFallbackMannequin: section.content.showFallbackMannequin,
      }}
      selectedProductId={context.selectedViewerProductId}
      onSelectProduct={(productId) => context.onSelectViewerProduct(productId, false)}
    />
  );
};

const ProductReviewsAdapter: SectionAdapter<'productReviews'> = ({ section, context }) => {
  const productId = section.content.source.kind === 'productReviews' ? section.content.source.productId : undefined;
  const products = productId ? context.products.filter((product) => product.id === productId) : context.products;
  const reviews = productId ? context.reviews.filter((review) => review.productId === productId) : context.reviews;
  return (
    <ProductReviewsSection
      products={products}
      reviews={reviews}
      onReviewsChanged={context.onReviewsChanged}
      language={context.language}
      selectedProductId={productId ?? context.selectedReviewsProductId}
      schemaContent={{
        badge: localize(section.content.badge, context),
        title: localize(section.content.title, context),
        description: localize(section.content.description, context),
        allowSubmissions: section.content.allowSubmissions,
        showFilters: section.content.showFilters,
      }}
    />
  );
};

const StreetStyleAdapter: SectionAdapter<'streetStyleLookbook'> = ({ section, context }) => (
  <StreetStyleLookbook
    language={context.language}
    onShopLook={context.onShopLook}
    schemaContent={{ badge: localize(section.content.badge, context), title: localize(section.content.title, context) }}
  />
);

const SerialVerifierAdapter: SectionAdapter<'serialVerifier'> = ({ section, context }) => (
  <SerialVerifier
    language={context.language}
    schemaContent={{
      badge: localize(section.content.badge, context),
      title: localize(section.content.title, context),
      description: localize(section.content.description, context),
      submitLabel: localize(section.content.submitLabel, context),
      demoSerials: section.content.demoSerials,
    }}
  />
);

const ArchivalVaultAdapter: SectionAdapter<'archivalVault'> = ({ section, context }) => (
  <ArchivalVaultTeaser
    language={context.language}
    schemaContent={{
      badge: localize(section.content.badge, context),
      title: localize(section.content.title, context),
      description: localize(section.content.description, context),
    }}
  />
);

const FaqAdapter: SectionAdapter<'faq'> = ({ section, context }) => (
  <FaqSection
    language={context.language}
    t={{
      badge: localize(section.content.badge, context),
      title: localize(section.content.title, context),
      subtitle: localize(section.content.subtitle, context),
      items: section.content.items.filter((item) => item.visible).map((item) => ({
        id: item.id,
        category: localize(item.category, context),
        question: localize(item.question, context),
        answer: localize(item.answer, context),
      })),
    }}
  />
);

const ContactAdapter: SectionAdapter<'contact'> = ({ section, context }) => (
  <ContactSection
    language={context.language}
    schemaContent={{
      badge: localize(section.content.badge, context),
      title: localize(section.content.title, context),
      description: localize(section.content.description, context),
      email: section.content.email,
      phoneDisplay: section.content.phoneDisplay,
      whatsappNumber: section.content.whatsappNumber,
      responseTime: localize(section.content.responseTime, context),
    }}
  />
);

const FooterAdapter: SectionAdapter<'footer'> = ({ section, context }) => {
  const links = section.content.links;
  return (
    <Footer
      t={{
        brandDesc: localize(section.content.brandDescription, context),
        navHeading: localize(section.content.navigationHeading, context),
        topLink: localize(links[0]?.label ?? { en: '', ar: '' }, context),
        conceptLink: localize(links[1]?.label ?? { en: '', ar: '' }, context),
        piecesLink: localize(links[2]?.label ?? { en: '', ar: '' }, context),
        sizeLink: localize(links[3]?.label ?? { en: '', ar: '' }, context),
        notifyHeading: localize(section.content.notificationHeading, context),
        notifyDesc: localize(section.content.notificationDescription, context),
        emailPlaceholder: localize(section.content.emailPlaceholder, context),
        joinBtn: localize(section.content.joinLabel, context),
        joinedMsg: localize(section.content.joinedMessage, context),
        communityHeading: localize(section.content.communityHeading, context),
        copyright: localize(section.content.copyright, context),
        edition: localize(section.content.edition, context),
      }}
    />
  );
};

export const sectionRegistry = {
  hero: HeroSectionAdapter,
  calligraphicBanner: CalligraphicBannerAdapter,
  brandStory: BrandStoryAdapter,
  editorialLookbook: EditorialLookbookAdapter,
  productShowcase: ProductShowcaseAdapter,
  garmentViewer: GarmentViewerAdapter,
  productReviews: ProductReviewsAdapter,
  streetStyleLookbook: StreetStyleAdapter,
  serialVerifier: SerialVerifierAdapter,
  archivalVault: ArchivalVaultAdapter,
  faq: FaqAdapter,
  contact: ContactAdapter,
  footer: FooterAdapter,
} satisfies SectionRegistry;

interface SectionRendererProps {
  section: PageSection;
  context: StorefrontContext;
}

/** Exhaustive dispatch keeps stored type strings constrained to known React components. */
export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, context }) => {
  switch (section.type) {
    case 'hero': return React.createElement(sectionRegistry.hero, { section, context });
    case 'calligraphicBanner': return React.createElement(sectionRegistry.calligraphicBanner, { section, context });
    case 'brandStory': return React.createElement(sectionRegistry.brandStory, { section, context });
    case 'editorialLookbook': return React.createElement(sectionRegistry.editorialLookbook, { section, context });
    case 'productShowcase': return React.createElement(sectionRegistry.productShowcase, { section, context });
    case 'garmentViewer': return React.createElement(sectionRegistry.garmentViewer, { section, context });
    case 'productReviews': return React.createElement(sectionRegistry.productReviews, { section, context });
    case 'streetStyleLookbook': return React.createElement(sectionRegistry.streetStyleLookbook, { section, context });
    case 'serialVerifier': return React.createElement(sectionRegistry.serialVerifier, { section, context });
    case 'archivalVault': return React.createElement(sectionRegistry.archivalVault, { section, context });
    case 'faq': return React.createElement(sectionRegistry.faq, { section, context });
    case 'contact': return React.createElement(sectionRegistry.contact, { section, context });
    case 'footer': return React.createElement(sectionRegistry.footer, { section, context });
  }
};

export type {
  ArchivalVaultSection,
  BrandStorySection,
  CalligraphicBannerSection,
  ContactPageSection,
  EditorialLookbookSection,
  FaqPageSection,
  FooterPageSection,
  GarmentViewerSection,
  HeroPageSection,
  ProductReviewsPageSection,
  ProductShowcaseSection,
  SerialVerifierSection,
  StreetStyleLookbookSection,
};
