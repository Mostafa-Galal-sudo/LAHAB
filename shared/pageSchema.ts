/**
 * Database-backed page document contract.
 *
 * This schema intentionally contains data only: no JSX, executable JavaScript,
 * Tailwind class names, or unrestricted CSS. Array position is the canonical
 * order for both sections and nested items.
 */

export const PAGE_SCHEMA_VERSION = 1 as const;

export type LocalizedText = {
  en: string;
  ar: string;
};

export type AssetReference = {
  assetId: string;
};

export type Vector3 = [number, number, number];
export type HexColor = `#${string}`;

export type ThemeColorToken =
  | 'primary'
  | 'surface'
  | 'surfaceElevated'
  | 'accent'
  | 'accentMuted'
  | 'text'
  | 'textMuted'
  | 'transparent';

export type ColorValue =
  | { kind: 'theme'; token: ThemeColorToken }
  | { kind: 'hex'; value: HexColor };

export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ContentWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type TextAlignment = 'start' | 'center' | 'end';
export type TypographyFamily = 'heading' | 'body' | 'mono';
export type TypographyScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'black';

export type SectionBackground =
  | { kind: 'theme'; token: ThemeColorToken }
  | { kind: 'solid'; color: ColorValue }
  | {
      kind: 'image';
      asset: AssetReference;
      position: 'center' | 'top' | 'bottom' | 'left' | 'right';
      fit: 'cover' | 'contain';
      overlay?: ColorValue;
      overlayOpacity?: number;
    };

export interface SectionStyle {
  background: SectionBackground;
  paddingTop: SpacingSize;
  paddingBottom: SpacingSize;
  contentWidth: ContentWidth;
  textAlign: TextAlignment;
  textColor?: ColorValue;
  accentColor?: ColorValue;
  headingFamily?: TypographyFamily;
  headingScale?: TypographyScale;
  headingWeight?: FontWeight;
}

export interface ResponsiveSectionSettings {
  mobile?: {
    paddingTop?: SpacingSize;
    paddingBottom?: SpacingSize;
    textAlign?: TextAlignment;
  };
  tablet?: {
    paddingTop?: SpacingSize;
    paddingBottom?: SpacingSize;
    textAlign?: TextAlignment;
  };
}

export type PageAction =
  | { type: 'scrollToSection'; sectionId: string }
  | { type: 'link'; href: string; target: 'self' | 'blank' }
  | { type: 'openSizeGuide' };

export interface ActionItem {
  id: string;
  label: LocalizedText;
  action: PageAction;
  variant: 'primary' | 'secondary' | 'text';
}

interface SectionBase<TType extends string, TContent> {
  id: string;
  type: TType;
  visible: boolean;
  content: TContent;
  style: SectionStyle;
  responsive?: ResponsiveSectionSettings;
}

export interface HeroContent {
  badge: LocalizedText;
  tagline: LocalizedText;
  subTagline: LocalizedText;
  aestheticTag: LocalizedText;
  fabricTag: LocalizedText;
  editionLabel: LocalizedText;
  editionValue: LocalizedText;
  shippingLabel: LocalizedText;
  shippingValue: LocalizedText;
  scrollPrompt: LocalizedText;
  backgroundImage: AssetReference;
  actions: ActionItem[];
}

export type HeroSection = SectionBase<'hero', HeroContent>;

export interface BannerItem {
  id: string;
  text: LocalizedText;
  emphasis: 'normal' | 'accent' | 'muted';
}

export type CalligraphicBannerSection = SectionBase<
  'calligraphicBanner',
  { items: BannerItem[]; showWordmark: boolean }
>;

export interface BrandFeatureItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export type BrandStorySection = SectionBase<
  'brandStory',
  {
    badge: LocalizedText;
    headline: LocalizedText;
    body: LocalizedText;
    bodyMobile: LocalizedText;
    visualLabel: LocalizedText;
    materialTags: LocalizedText[];
    features: BrandFeatureItem[];
  }
>;

export interface EditorialCardItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: AssetReference;
  action?: ActionItem;
}

export type EditorialLookbookSection = SectionBase<
  'editorialLookbook',
  {
    badge: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
    cards: EditorialCardItem[];
  }
>;

export type ProductDataSource =
  | { kind: 'allProducts' }
  | { kind: 'selectedProducts'; productIds: string[] };

export type ProductShowcaseSection = SectionBase<
  'productShowcase',
  {
    badge: LocalizedText;
    title: LocalizedText;
    limitedUnits: LocalizedText;
    assuranceTitle: LocalizedText;
    assuranceDescription: LocalizedText;
    source: ProductDataSource;
  }
>;

export type ModelFormat = 'obj' | 'glb';
export type LightingPreset = 'studio' | 'softbox' | 'dramatic' | 'neutral';

export interface ModelPresentation {
  assetId: string;
  format: ModelFormat;
  scale: Vector3;
  position: Vector3;
  rotation: Vector3;
  cameraPosition: Vector3;
  autoRotate: boolean;
  autoRotateSpeed: number;
  backgroundColor: HexColor;
  lightingPreset: LightingPreset;
  materialColor?: HexColor;
}

export type GarmentViewerSection = SectionBase<
  'garmentViewer',
  {
    badge: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    productSource: { kind: 'firstAvailableProduct' } | { kind: 'product'; productId: string };
    model: ModelPresentation;
    allowManualOrbit: boolean;
    showFallbackMannequin: boolean;
  }
>;

export type ProductReviewsSection = SectionBase<
  'productReviews',
  {
    badge: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    source: { kind: 'allProductReviews' } | { kind: 'productReviews'; productId: string };
    allowSubmissions: boolean;
    showFilters: boolean;
  }
>;

export interface StreetLookItem {
  id: string;
  image: AssetReference;
  location: LocalizedText;
  modelName: LocalizedText;
  productName: LocalizedText;
  stylingNotes: LocalizedText;
  sizeWorn: string;
  productId?: string;
  region: 'cairo' | 'dubai' | 'london' | 'other';
  visible: boolean;
}

export type StreetStyleLookbookSection = SectionBase<
  'streetStyleLookbook',
  {
    badge: LocalizedText;
    title: LocalizedText;
    items: StreetLookItem[];
  }
>;

export type SerialVerifierSection = SectionBase<
  'serialVerifier',
  {
    badge: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    inputLabel: LocalizedText;
    submitLabel: LocalizedText;
    demoSerials: string[];
  }
>;

export interface VaultPieceItem {
  id: string;
  name: LocalizedText;
  details: LocalizedText;
  status: LocalizedText;
  visible: boolean;
}

export type ArchivalVaultSection = SectionBase<
  'archivalVault',
  {
    badge: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    countdownTarget?: string;
    pieces: VaultPieceItem[];
    allowPasscode: boolean;
    allowWaitlist: boolean;
  }
>;

export interface FaqItem {
  id: string;
  category: LocalizedText;
  question: LocalizedText;
  answer: LocalizedText;
  visible: boolean;
}

export type FaqSection = SectionBase<
  'faq',
  {
    badge: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
    items: FaqItem[];
  }
>;

export interface InquiryCategoryItem {
  id: string;
  value: string;
  label: LocalizedText;
}

export type ContactSection = SectionBase<
  'contact',
  {
    badge: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    email: string;
    phoneDisplay: string;
    whatsappNumber: string;
    responseTime: LocalizedText;
    inquiryCategories: InquiryCategoryItem[];
  }
>;

export interface FooterLinkItem {
  id: string;
  label: LocalizedText;
  action: PageAction;
}

export type FooterSection = SectionBase<
  'footer',
  {
    brandDescription: LocalizedText;
    navigationHeading: LocalizedText;
    links: FooterLinkItem[];
    notificationHeading: LocalizedText;
    notificationDescription: LocalizedText;
    emailPlaceholder: LocalizedText;
    joinLabel: LocalizedText;
    joinedMessage: LocalizedText;
    communityHeading: LocalizedText;
    copyright: LocalizedText;
    edition: LocalizedText;
  }
>;

export type PageSection =
  | HeroSection
  | CalligraphicBannerSection
  | BrandStorySection
  | EditorialLookbookSection
  | ProductShowcaseSection
  | GarmentViewerSection
  | ProductReviewsSection
  | StreetStyleLookbookSection
  | SerialVerifierSection
  | ArchivalVaultSection
  | FaqSection
  | ContactSection
  | FooterSection;

export type PageSectionType = PageSection['type'];

export interface PageDocument {
  schemaVersion: typeof PAGE_SCHEMA_VERSION;
  id: string;
  slug: string;
  title: LocalizedText;
  settings: {
    defaultLanguage: 'en' | 'ar';
    supportedLanguages: ['en', 'ar'];
    defaultTheme: 'navy' | 'desert';
  };
  sections: PageSection[];
}

