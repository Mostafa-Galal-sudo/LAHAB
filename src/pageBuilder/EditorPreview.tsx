import React, { useEffect, useMemo, useState } from 'react';
import type { PageDocument } from '../../shared/pageSchema';
import { translations, type Language } from '../translations';
import { getProducts, getReviews } from '../lib/api';
import { FALLBACK_PRODUCTS } from '../lib/fallbackProducts';
import type { ProductItem, ProductReview } from '../types';
import PageRenderer from './PageRenderer';
import type { StorefrontContext } from './StorefrontContext';
import { isEditorMessage, type PreviewToEditorMessage } from './editorMessages';

const notifyParent = (message: PreviewToEditorMessage) => window.parent.postMessage(message, window.location.origin);

/** Isolated, non-transactional preview. It never fetches drafts and cannot mutate commerce state. */
const EditorPreview: React.FC = () => {
  const [page, setPage] = useState<PageDocument | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    Promise.all([getProducts().catch(() => FALLBACK_PRODUCTS), getReviews().catch(() => [])]).then(([nextProducts, nextReviews]) => {
      setProducts(nextProducts.length ? nextProducts : FALLBACK_PRODUCTS);
      setReviews(nextReviews);
    });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isEditorMessage(event.data)) return;
      if (event.data.type === 'lahab:preview-document') {
        setPage(event.data.page);
        setLanguage(event.data.language);
        document.documentElement.lang = event.data.language;
        document.documentElement.dir = event.data.language === 'ar' ? 'rtl' : 'ltr';
        requestAnimationFrame(() => {
          document.querySelectorAll('[data-editor-selected]').forEach((element) => element.removeAttribute('data-editor-selected'));
          if (event.data.selectedSectionId) {
            document.querySelector(`[data-editor-section-id="${CSS.escape(event.data.selectedSectionId)}"]`)?.setAttribute('data-editor-selected', 'true');
          }
        });
      } else {
        document.querySelector(`[data-editor-section-id="${CSS.escape(event.data.sectionId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    const blockTransactions = (event: Event) => event.preventDefault();
    const selectSection = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const section = target?.closest<HTMLElement>('[data-editor-section-id]');
      if (!section) return;
      event.preventDefault();
      event.stopPropagation();
      notifyParent({
        type: 'lahab:preview-select',
        sectionId: section.dataset.editorSectionId!,
        path: section.dataset.editorPath ?? '',
      });
    };
    window.addEventListener('message', onMessage);
    document.addEventListener('submit', blockTransactions, true);
    document.addEventListener('click', selectSection, true);
    notifyParent({ type: 'lahab:preview-ready' });
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('submit', blockTransactions, true);
      document.removeEventListener('click', selectSection, true);
    };
  }, []);

  const context = useMemo<StorefrontContext>(() => ({
    products,
    reviews,
    language,
    isArabic: language === 'ar',
    theme: page?.settings.defaultTheme ?? 'navy',
    currency: 'EGP',
    translations: translations[language],
    savedProductIds: [],
    onAddToCart: () => undefined,
    onToggleWishlist: () => undefined,
    onOpenMonogram: () => undefined,
    onOpenFitVisualizer: () => undefined,
    onOpenReviews: () => undefined,
    onOpenSizeGuide: () => undefined,
    onReviewsChanged: () => undefined,
    onScrollToProducts: () => undefined,
    onShopLook: () => undefined,
  }), [language, page?.settings.defaultTheme, products, reviews]);

  if (!page) {
    return <div className="min-h-screen bg-[#0D1929] grid place-items-center text-[#D8A065] font-heading tracking-widest">DRAFT PREVIEW CONNECTING</div>;
  }
  return <main data-editor-preview-safe="true"><PageRenderer page={page} context={context} /></main>;
};

export default EditorPreview;
