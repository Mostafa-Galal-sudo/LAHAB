import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  Sparkles,
  Send,
  Check,
  Camera,
  Upload,
  X,
  ShieldCheck,
  UserCheck,
  Image as ImageIcon,
  Maximize2,
  Ruler,
} from 'lucide-react';
import { ProductItem, ProductReview, ProductId, GarmentSize } from '../types';
import { createReview, likeReview } from '../lib/api';
import { Language } from '../translations';

interface ProductReviewsSectionProps {
  products: ProductItem[];
  reviews: ProductReview[];
  onReviewsChanged: () => void;
  language: Language;
  selectedProductId?: ProductId;
  schemaContent?: {
    badge: string;
    title: string;
    description: string;
    allowSubmissions: boolean;
    showFilters: boolean;
  };
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  products,
  reviews,
  onReviewsChanged,
  language,
  selectedProductId,
  schemaContent,
}) => {
  const isArabic = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  // BUG FIX: reviews used to live in localStorage (per-browser only, invisible to
  // every other visitor). They're now fetched once in App.tsx from the real
  // server database via /api/reviews and passed down here as a prop.

  // Filters
  const [activeProductFilter, setActiveProductFilter] = useState<ProductId | 'all'>(
    selectedProductId || 'all'
  );
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sizeFilter, setSizeFilter] = useState<GarmentSize | 'all'>('all');
  const [heightFilter, setHeightFilter] = useState<'all' | '160-175' | '176-188' | '189+'>('all');
  const [weightFilter, setWeightFilter] = useState<'all' | '50-70' | '71-85' | '86+'>('all');
  const [hasPhotosOnly, setHasPhotosOnly] = useState<boolean>(false);
  const [verifiedWearerOnly, setVerifiedWearerOnly] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fullscreen Photo Lightbox Modal State
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // New Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductId>(selectedProductId || products[0]?.id || '');

  // Products load asynchronously from the server - default the form's product
  // picker once they arrive if nothing has been selected yet.
  useEffect(() => {
    if (!selectedProduct && products.length > 0) {
      setSelectedProduct(products[0].id);
    }
  }, [products, selectedProduct]);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('L');
  const [reviewTitle, setReviewTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [clientStats, setClientStats] = useState<{ heightCm: string; weightKg: string }>({
    heightCm: '',
    weightKg: '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Rating label helper
  const getRatingSentiment = (rating: number) => {
    if (isArabic) {
      switch (rating) {
        case 5:
          return 'استثنائي — خامة معمارية فائقة';
        case 4:
          return 'ممتاز — جودة وتفاصيل راقية';
        case 3:
          return 'جيد — قصة مريحة';
        case 2:
          return 'مقبول';
        default:
          return 'بحاجة للتحسين';
      }
    }
    switch (rating) {
      case 5:
        return 'Exceptional — Monumental Craft & Drape';
      case 4:
        return 'Great — Heavyweight Luxury Quality';
      case 3:
        return 'Good — Substantial Relaxed Fit';
      case 2:
        return 'Fair';
      default:
        return 'Needs Improvement';
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (activeProductFilter !== 'all' && rev.productId !== activeProductFilter) {
        return false;
      }
      if (starFilter !== 'all' && rev.rating !== starFilter) {
        return false;
      }
      if (sizeFilter !== 'all' && rev.sizePurchased !== sizeFilter) {
        return false;
      }
      if (hasPhotosOnly && (!rev.photos || rev.photos.length === 0)) {
        return false;
      }
      if (verifiedWearerOnly && !rev.verifiedWearer) {
        return false;
      }
      if (heightFilter !== 'all') {
        const h = rev.clientStats?.heightCm;
        if (!h) return false;
        if (heightFilter === '160-175' && (h < 160 || h > 175)) return false;
        if (heightFilter === '176-188' && (h < 176 || h > 188)) return false;
        if (heightFilter === '189+' && h < 189) return false;
      }
      if (weightFilter !== 'all') {
        const w = rev.clientStats?.weightKg;
        if (!w) return false;
        if (weightFilter === '50-70' && (w < 50 || w > 70)) return false;
        if (weightFilter === '71-85' && (w < 71 || w > 85)) return false;
        if (weightFilter === '86+' && w < 86) return false;
      }
      return true;
    });
  }, [reviews, activeProductFilter, starFilter, sizeFilter, heightFilter, weightFilter, hasPhotosOnly, verifiedWearerOnly]);

  // Security sanitization helper to prevent script / tag injection
  const sanitizeInput = (text: string, maxLength: number) => {
    return text
      .replace(/[<>]/g, '') // Strip angle brackets to eliminate HTML/script injection
      .trim()
      .slice(0, maxLength);
  };

  // Handle Photo File Upload with client-side compression / canvas resizing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedPhotos.length + files.length > 3) {
      setPhotoError(
        isArabic
          ? 'الحد الأقصى المسموح به هو 3 صور لكل مقتنٍ'
          : 'Maximum 3 fit photos allowed per review'
      );
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setPhotoError(isArabic ? 'يرجى اختيار صور بصيغة صالحة' : 'Please select image files only');
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setPhotoError(isArabic ? 'حجم الصورة يجب ألا يتجاوز 8 ميجابايت' : 'Image size must be under 8MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          // Compress image via offscreen canvas to keep upload payloads small and fast
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
              setUploadedPhotos((prev) => [...prev, compressedDataUrl].slice(0, 3));
            }
          };
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Statistics calculation
  const relevantForStats = useMemo(() => {
    if (activeProductFilter === 'all') return reviews;
    return reviews.filter((r) => r.productId === activeProductFilter);
  }, [reviews, activeProductFilter]);

  const hasReviews = relevantForStats.length > 0;

  const averageRating = useMemo(() => {
    if (relevantForStats.length === 0) return '—';
    const sum = relevantForStats.reduce((acc, r) => acc + r.rating, 0);
    return (sum / relevantForStats.length).toFixed(1);
  }, [relevantForStats]);

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    relevantForStats.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    return counts;
  }, [relevantForStats]);

  // Handle Likes via the server (persists globally, not just in this browser)
  const handleLikeReview = async (reviewId: string) => {
    try {
      await likeReview(reviewId);
      onReviewsChanged();
    } catch {
      // Non-critical - silently ignore a failed like
    }
  };

  // Handle Form Submission with security bounds. Validation is duplicated here for
  // fast UX feedback, but the server independently re-validates and sanitizes
  // everything (see server/routes/reviews.ts) since this is a public endpoint.
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAuthor = sanitizeInput(authorName, 60);
    const cleanComment = sanitizeInput(commentText, 800);
    const cleanCity = sanitizeInput(city, 60);
    const cleanTitle = sanitizeInput(reviewTitle, 100);

    if (!cleanAuthor || !cleanComment) {
      setFormError(
        isArabic ? 'يرجى إدخال اسمك ورأيك في القطعة' : 'Please provide your name and review comment'
      );
      return;
    }
    setFormError('');

    const boundedRating = Math.max(1, Math.min(5, Math.floor(newRating)));

    const parsedHeight = clientStats.heightCm ? parseInt(clientStats.heightCm, 10) : undefined;
    const parsedWeight = clientStats.weightKg ? parseInt(clientStats.weightKg, 10) : undefined;

    try {
      await createReview({
        productId: selectedProduct,
        authorName: cleanAuthor,
        rating: boundedRating,
        sizePurchased: selectedSize,
        city: cleanCity || (isArabic ? 'القاهرة' : 'Cairo'),
        title: cleanTitle || (isArabic ? 'رأي حول الخامة والتفاصيل' : 'Client Feedback'),
        comment: cleanComment,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
        clientStats:
          parsedHeight || parsedWeight
            ? { heightCm: parsedHeight, weightKg: parsedWeight }
            : undefined,
      } as any);

      onReviewsChanged();
      setFormSuccess(true);
      setAuthorName('');
      setCity('');
      setReviewTitle('');
      setCommentText('');
      setUploadedPhotos([]);
      setClientStats({ heightCm: '', weightKg: '' });

      setTimeout(() => {
        setFormSuccess(false);
        setIsFormOpen(false);
      }, 2200);
    } catch (err: any) {
      setFormError(
        err.message || (isArabic ? 'حدث خطأ أثناء إرسال التقييم' : 'Something went wrong submitting your review')
      );
    }
  };

  return (
    <section
      id="reviews"
      className="bg-[#0B1524] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-20 sm:py-24 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E2E6E8]/20 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 px-3 py-1 bg-[#132238]/60 text-xs font-heading text-[#D8A065] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{schemaContent?.badge || (isArabic ? 'آراء العملاء وصور المقتنين' : 'CLIENT REVIEWS & FIT GALLERY')}</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#D8A065] uppercase tracking-wide">
              {schemaContent?.title || (isArabic ? 'التقييمات وصور الإطلالات' : 'REVIEWS FROM OUR COLLECTORS')}
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 max-w-xl leading-relaxed">
              {schemaContent?.description || (isArabic
                ? 'شهادات حقيقية وصور إطلالات من مقتني الإصدار الأول في القاهرة، الإسكندرية، الرياض، ودبي حول وزن نسيج 520 جرام وتطريز خيوط الذهب وقصة الأكتاف.'
                : 'Authentic reviews and real fit photos from verified collectors across Cairo, Dubai, and Riyadh highlighting the 520 GSM drape and gold diacritic embroidery.')}
            </p>
          </div>

          {(schemaContent?.allowSubmissions ?? true) && <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="btn-lahab-primary px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shadow-lg"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{isFormOpen ? (isArabic ? 'إغلاق النموذج' : 'CLOSE FORM') : (isArabic ? 'إضافة تقييم وصور' : 'WRITE A REVIEW & UPLOAD FIT')}</span>
          </button>}
        </div>

        {/* Rating Breakdown Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#0D1929] border border-[#D8A065]/30 p-6 sm:p-8">
          {/* Main Average Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#E2E6E8]/15 space-y-2">
            <span className={`font-heading ${hasReviews ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'} font-bold text-[#D8A065]`}>
              {hasReviews ? averageRating : (isArabic ? 'إصدار جديد' : 'NEW DROP')}
            </span>
            <div className="flex items-center gap-1 text-[#D8A065]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    hasReviews && Number(averageRating) >= star
                      ? 'fill-[#D8A065] text-[#D8A065]'
                      : 'text-[#E2E6E8]/20'
                  }`}
                />
              ))}
            </div>
            <p className="font-mono text-xs text-[#E2E6E8]/60">
              {hasReviews
                ? `${relevantForStats.length} ${isArabic ? 'تقييم موثق من مقتني القطعة' : 'verified collector ratings'}`
                : isArabic
                ? 'كن أول من يوثق رأيه في الإصدار'
                : 'Awaiting first drop reviews'}
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
            {[5, 4, 3, 2, 1].map((ratingNum) => {
              const count = starCounts[ratingNum] || 0;
              const pct = hasReviews ? Math.round((count / relevantForStats.length) * 100) : 0;

              return (
                <div key={ratingNum} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 text-[#D8A065] font-bold flex items-center gap-1">
                    <span>{ratingNum}</span>
                    <Star className="w-3.5 h-3.5 fill-[#D8A065]" />
                  </span>

                  <div className="flex-1 h-2 bg-[#132238] rounded-full overflow-hidden border border-[#E2E6E8]/15">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-linear-to-r from-[#D8A065] to-[#B3783E]"
                    />
                  </div>

                  <span className="w-10 text-right text-[#E2E6E8]/70">{pct}%</span>
                  <span className="w-10 text-right text-[#E2E6E8]/40">({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Review & Fit Photo Submission Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border border-[#D8A065] bg-[#0D1929] p-6 sm:p-8 relative"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="border-b border-[#E2E6E8]/20 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-heading text-xl text-[#D8A065] uppercase tracking-wide flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      <span>{isArabic ? 'إضافة تقييم وصور الإطلالة' : 'SHARE YOUR VERIFIED FIT & REVIEW'}</span>
                    </h3>
                    <p className="font-body text-xs text-[#E2E6E8]/70">
                      {isArabic
                        ? 'انطباعك يساعد مجتمع المقتنين في اختيار المقاس المناسب ويوثق متانة نسيج 520 جرام.'
                        : 'Help fellow collectors gauge the 520 GSM architectural drape, sizing, and styling.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-[#E2E6E8]/60 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formSuccess ? (
                  <div className="p-8 border border-[#22c55e] bg-[#132238] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="font-heading text-sm text-[#22c55e] uppercase tracking-wider">
                      {isArabic
                        ? 'شكراً لك! تم نشر تقييمك وصور إطلالتك بنجاح وحصولك على شارة المقتني الموثق.'
                        : 'Thank you! Your verified review and fit photos have been published with the Verified Wearer badge.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    {formError && (
                      <div className="p-3 border border-red-500 bg-red-950/40 text-red-300 text-xs font-body">
                        {formError}
                      </div>
                    )}

                    {/* Interactive Star Rating Selector */}
                    <div className="space-y-2 bg-[#132238]/70 p-4 border border-[#E2E6E8]/20">
                      <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                        {isArabic ? 'تقييم النجوم (اضغط لتحديد عدد النجوم) *' : 'Your Star Rating (Click to select) *'}
                      </label>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                              title={`${star} stars`}
                            >
                              <Star
                                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                  star <= (hoverRating || newRating)
                                    ? 'fill-[#D8A065] text-[#D8A065]'
                                    : 'text-[#E2E6E8]/30 hover:text-[#D8A065]/70'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <span className="font-mono text-xs text-[#D8A065] font-bold">
                          {newRating} / 5 — {getRatingSentiment(hoverRating || newRating)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'اسمك الكامل *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder={isArabic ? 'مثال: عمر الشريف' : 'e.g. Omar El-Sherif'}
                          className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                        />
                      </div>

                      {/* City / Location */}
                      <div className="space-y-1.5">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'المدينة / المنطقة' : 'City / Governorate'}
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={isArabic ? 'مثال: القاهرة (الزمالك)' : 'e.g. Cairo (Zamalek)'}
                          className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Product */}
                      <div className="space-y-1.5">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'القطعة المقتناة *' : 'Garment Acquired *'}
                        </label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value as ProductId)}
                          className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] cursor-pointer"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name[language]} ({p.weight})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Size */}
                      <div className="space-y-1.5">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'المقاس المجرّب *' : 'Size Tested *'}
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value as GarmentSize)}
                          className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] cursor-pointer"
                        >
                          <option value="S">S // Small</option>
                          <option value="M">M // Medium</option>
                          <option value="L">L // Large</option>
                          <option value="XL">XL // Extra Large</option>
                          <option value="XXL">XXL // Double Extra Large</option>
                        </select>
                      </div>
                    </div>

                    {/* Wearer Stats (Optional Height / Weight to assist fit gauge) */}
                    {/* SECURITY/INTEGRITY FIX: removed the self-declared "Verified Wearer" checkbox.
                        There is no backend purchase record to check this against, so letting anyone
                        tick a box and be labeled "Verified" on their own say-so was a fake trust
                        signal. Verification badges must only ever be set by server-side logic that
                        can confirm an actual purchase. */}
                    <div className="bg-[#132238]/50 border border-[#E2E6E8]/15 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-heading text-[#D8A065] uppercase tracking-wider">
                        <Ruler className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'مقاييس المقتني للمساعدة في المقاس (اختياري)' : 'Wearer Stats for Fit Reference (Optional)'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-mono text-[#E2E6E8]/70 block mb-1">
                            {isArabic ? 'الطول (سم)' : 'Height (cm)'}
                          </label>
                          <input
                            type="number"
                            min="120"
                            max="220"
                            placeholder="e.g. 182"
                            value={clientStats.heightCm}
                            onChange={(e) => setClientStats((prev) => ({ ...prev, heightCm: e.target.value }))}
                            className="w-full bg-[#0D1929] border border-[#E2E6E8]/20 px-3 py-1.5 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-mono text-[#E2E6E8]/70 block mb-1">
                            {isArabic ? 'الوزن (كجم)' : 'Weight (kg)'}
                          </label>
                          <input
                            type="number"
                            min="40"
                            max="180"
                            placeholder="e.g. 78"
                            value={clientStats.weightKg}
                            onChange={(e) => setClientStats((prev) => ({ ...prev, weightKg: e.target.value }))}
                            className="w-full bg-[#0D1929] border border-[#E2E6E8]/20 px-3 py-1.5 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-1.5">
                      <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                        {isArabic ? 'عنوان التقييم' : 'Review Headline'}
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder={
                          isArabic
                            ? 'مثال: وزن القماش فائق وثبات القصة لا مثيل له'
                            : 'e.g. Outstanding 520 GSM drape and structured cuffs'
                        }
                        className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                      />
                    </div>

                    {/* Detailed Comment */}
                    <div className="space-y-1.5">
                      <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                        {isArabic ? 'التعليق والملاحظات حول النسيج والقصة *' : 'Detailed Feedback on Fabric & Drape *'}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          isArabic
                            ? 'صف تجربتك مع القطعة، نعومة القطن، تطريز الذهب، ثبات الياقة، وتجربة التوصيل...'
                            : 'Describe your experience with the heavyweight cotton, embroidery texture, collar stiffness, and doorstep courier inspection...'
                        }
                        className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                      />
                    </div>

                    {/* Photo Uploader Section (Max 3 Fit Photos) */}
                    <div className="space-y-3 bg-[#132238]/60 p-4 border border-[#E2E6E8]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-heading text-[#D8A065] uppercase tracking-wider">
                          <Camera className="w-4 h-4" />
                          <span>{isArabic ? 'صور الإطلالة والتنسيق (حتى 3 صور)' : 'UPLOAD FIT PHOTOS (UP TO 3)'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#E2E6E8]/60">
                          {uploadedPhotos.length} / 3 {isArabic ? 'صور' : 'Photos'}
                        </span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {/* Photo Previews or Upload Trigger Box */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                        {uploadedPhotos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded overflow-hidden border border-[#D8A065]/50 group bg-[#0D1929]"
                          >
                            <img
                              src={photoUrl}
                              alt={`Client fit photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 cursor-pointer shadow-md"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {uploadedPhotos.length < 3 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-[#E2E6E8]/30 hover:border-[#D8A065] bg-[#0D1929]/80 flex flex-col items-center justify-center p-3 text-center transition-colors cursor-pointer group"
                          >
                            <Upload className="w-5 h-5 text-[#E2E6E8]/50 group-hover:text-[#D8A065] transition-colors mb-1.5" />
                            <span className="text-[11px] font-heading text-[#E2E6E8]/70 group-hover:text-[#D8A065]">
                              {isArabic ? 'أضف صورة' : 'Add Photo'}
                            </span>
                          </button>
                        )}
                      </div>

                      {photoError && (
                        <p className="text-xs text-red-400 font-mono mt-1">{photoError}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2.5 border border-[#E2E6E8]/30 text-xs font-heading text-[#E2E6E8]/70 hover:text-[#E2E6E8] cursor-pointer"
                      >
                        {isArabic ? 'إلغاء' : 'CANCEL'}
                      </button>

                      <button
                        type="submit"
                        className="btn-lahab-primary px-8 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'نشر التقييم والصور' : 'PUBLISH REVIEW & PHOTOS'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E6E8]/15 pb-4">
          {/* Piece Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveProductFilter('all')}
              className={`px-3 py-1.5 text-xs font-heading tracking-wider uppercase border transition-all cursor-pointer ${
                activeProductFilter === 'all'
                  ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                  : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]'
              }`}
            >
              {isArabic ? 'جميع القطع' : 'ALL PIECES'} ({reviews.length})
            </button>

            {products.map((p) => {
              const pCount = reviews.filter((r) => r.productId === p.id).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveProductFilter(p.id)}
                  className={`px-3 py-1.5 text-xs font-heading tracking-wider uppercase border transition-all cursor-pointer ${
                    activeProductFilter === p.id
                      ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                      : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]'
                  }`}
                >
                  {p.name[language]} ({p.weight}) ({pCount})
                </button>
              );
            })}
          </div>

          {/* Quick Filters: With Photos, Verified Wearer, Stars, Size */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Photos Only Filter Toggle */}
            <button
              type="button"
              onClick={() => setHasPhotosOnly(!hasPhotosOnly)}
              className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                hasPhotosOnly
                  ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065] font-bold'
                  : 'border-[#E2E6E8]/25 bg-[#132238] text-[#E2E6E8]/70 hover:border-[#D8A065]/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مع صور فقط' : 'With Photos'}</span>
            </button>

            {/* Verified Wearer Only Toggle */}
            <button
              type="button"
              onClick={() => setVerifiedWearerOnly(!verifiedWearerOnly)}
              className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                verifiedWearerOnly
                  ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065] font-bold'
                  : 'border-[#E2E6E8]/25 bg-[#132238] text-[#E2E6E8]/70 hover:border-[#D8A065]/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D8A065]" />
              <span>{isArabic ? 'مقتنون موثقون' : 'Verified Wearers'}</span>
            </button>

            {/* Stars dropdown */}
            <select
              value={starFilter}
              onChange={(e) =>
                setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-[#132238] border border-[#E2E6E8]/30 px-2.5 py-1 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] cursor-pointer"
            >
              <option value="all">{isArabic ? 'كل النجوم' : 'All Stars'}</option>
              <option value="5">5 ★★★★★</option>
              <option value="4">4 ★★★★</option>
              <option value="3">3 ★★★</option>
            </select>

            {/* Size dropdown */}
            <select
              value={sizeFilter}
              onChange={(e) =>
                setSizeFilter(e.target.value === 'all' ? 'all' : (e.target.value as GarmentSize))
              }
              className="bg-[#132238] border border-[#E2E6E8]/30 px-2.5 py-1 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] cursor-pointer"
            >
              <option value="all">{isArabic ? 'كل المقاسات' : 'All Sizes'}</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>

            {/* Height filter dropdown */}
            <select
              value={heightFilter}
              onChange={(e) => setHeightFilter(e.target.value as any)}
              className="bg-[#132238] border border-[#E2E6E8]/30 px-2.5 py-1 text-xs text-[#D8A065] font-bold focus:outline-none focus:border-[#D8A065] cursor-pointer"
            >
              <option value="all">{isArabic ? 'كل الأطوال' : 'All Heights'}</option>
              <option value="160-175">160–175 cm</option>
              <option value="176-188">176–188 cm</option>
              <option value="189+">189+ cm</option>
            </select>

            {/* Weight filter dropdown */}
            <select
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value as any)}
              className="bg-[#132238] border border-[#E2E6E8]/30 px-2.5 py-1 text-xs text-[#D8A065] font-bold focus:outline-none focus:border-[#D8A065] cursor-pointer"
            >
              <option value="all">{isArabic ? 'كل الأوزان' : 'All Weights'}</option>
              <option value="50-70">50–70 kg</option>
              <option value="71-85">71–85 kg</option>
              <option value="86+">86+ kg</option>
            </select>
          </div>
        </div>

        {/* Reviews Cards List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 px-6 border border-[#E2E6E8]/20 bg-[#0D1929] space-y-4">
            <div className="w-14 h-14 rounded-full border border-[#D8A065]/40 bg-[#132238]/60 flex items-center justify-center mx-auto text-[#D8A065]">
              <Star className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-heading text-base text-[#E2E6E8] uppercase tracking-wider">
                {reviews.length === 0
                  ? (isArabic ? 'لا توجد تقييمات مسجلة بعد' : 'NO REVIEWS RECORDED YET')
                  : (isArabic ? 'لا توجد تعليقات تطابق خيارات التصفية' : 'NO CLIENT REVIEWS MATCH THIS FILTER')}
              </h3>
              <p className="font-body text-xs text-[#E2E6E8]/60 leading-relaxed">
                {reviews.length === 0
                  ? (isArabic
                      ? 'كن أول مقتنٍ يوثق انطباعه وتجربته مع تفاصيل القطعة وصور الإطلالة بعد استلامها.'
                      : 'Be the first collector to document your experience with the 520 GSM fleece, diacritic embroidery, and fit photos.')
                  : (isArabic ? 'جرّب تغيير خيارات النجوم أو المقاس أو إلغاء فلتر الصور للبحث في التقييمات.' : 'Try resetting your photo, star or size filter selection.')}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              {reviews.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="btn-lahab-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  {isArabic ? 'أضف أول تقييم وصور' : 'WRITE THE FIRST REVIEW'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductFilter('all');
                    setStarFilter('all');
                    setSizeFilter('all');
                    setHasPhotosOnly(false);
                    setVerifiedWearerOnly(false);
                  }}
                  className="btn-lahab-outline px-4 py-2 text-xs font-mono cursor-pointer"
                >
                  {isArabic ? 'إعادة ضبط التصفية' : 'Reset Filters'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((rev) => {
              const prod = products.find((p) => p.id === rev.productId);

              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-[#E2E6E8]/20 bg-[#0D1929] p-6 space-y-4 flex flex-col justify-between hover:border-[#D8A065]/60 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Card Top: Stars + Verified Badge + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#D8A065]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating ? 'fill-[#D8A065] text-[#D8A065]' : 'text-[#E2E6E8]/20'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="font-mono text-[11px] text-[#E2E6E8]/50">
                        {rev.date}
                      </span>
                    </div>

                    {/* Headline */}
                    <h4 className="font-heading text-base text-[#E2E6E8] uppercase tracking-wide">
                      "{rev.title}"
                    </h4>

                    {/* Review Body */}
                    <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Client Fit Photos Gallery in Card */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-heading text-[#D8A065] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'إطلالة المقتني الحقيقية' : 'VERIFIED CLIENT FIT'}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {rev.photos.map((imgUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setActiveLightboxImage(imgUrl)}
                              className="relative w-16 h-20 rounded overflow-hidden border border-[#D8A065]/40 hover:border-[#D8A065] group shrink-0 cursor-pointer"
                              title={isArabic ? 'اضغط لتكبير الصورة' : 'Click to enlarge'}
                            >
                              <img
                                src={imgUrl}
                                alt={`Fit photo ${pIdx + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-[#0D1929]/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-4 border-t border-[#E2E6E8]/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs text-[#D8A065] font-bold">
                            {rev.authorName}
                          </span>

                          {rev.verifiedWearer ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#D8A065]/50 bg-[#D8A065]/10 text-[10px] text-[#D8A065] font-mono rounded">
                              <ShieldCheck className="w-3 h-3 text-[#D8A065]" />
                              <span>{isArabic ? 'مقتنٍ موثق' : 'VERIFIED WEARER'}</span>
                            </span>
                          ) : rev.verifiedPurchase ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-mono">
                              <CheckCircle className="w-3 h-3" />
                              <span>{isArabic ? 'مقتني موثق' : 'Verified Buyer'}</span>
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#E2E6E8]/60 font-mono">
                          {rev.city && <span>{rev.city}</span>}
                          {rev.sizePurchased && (
                            <>
                              <span>•</span>
                              <span className="text-[#D8A065]">SIZE {rev.sizePurchased}</span>
                            </>
                          )}
                          {prod && (
                            <>
                              <span>•</span>
                              <span>{prod.weight}</span>
                            </>
                          )}
                          {rev.clientStats?.heightCm && (
                            <>
                              <span>•</span>
                              <span>{rev.clientStats.heightCm} cm</span>
                            </>
                          )}
                          {rev.clientStats?.weightKg && (
                            <>
                              <span>•</span>
                              <span>{rev.clientStats.weightKg} kg</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Helpful Upvote */}
                      <button
                        type="button"
                        onClick={() => handleLikeReview(rev.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E2E6E8]/20 hover:border-[#D8A065] text-[11px] font-mono text-[#E2E6E8]/70 hover:text-[#D8A065] transition-colors cursor-pointer shrink-0"
                        title="Helpful review"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{rev.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Fullscreen Photo Lightbox Modal */}
        <AnimatePresence>
          {activeLightboxImage && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setActiveLightboxImage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-4xl max-h-[90vh] overflow-hidden border border-[#D8A065] bg-[#0D1929]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveLightboxImage(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#0D1929]/90 border border-[#E2E6E8]/30 text-white flex items-center justify-center hover:border-[#D8A065] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={activeLightboxImage}
                  alt="Client fit full view"
                  className="w-full max-h-[85vh] object-contain"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductReviewsSection;
