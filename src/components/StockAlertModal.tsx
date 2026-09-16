import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Mail, Phone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ProductItem, GarmentSize } from '../types';
import { Language } from '../translations';

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  initialSize: GarmentSize;
  language: Language;
}

export const StockAlertModal: React.FC<StockAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  initialSize,
  language,
}) => {
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(initialSize);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sync initial size when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedSize(initialSize);
      setIsSubmitted(false);
    }
  }, [isOpen, initialSize]);

  if (!isOpen || !product) return null;

  const isArabic = language === 'ar';
  const outOfStockSizes = product.outOfStockSizes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !product) return;

    setLoading(true);
    setSubmitError('');

    // BUG FIX: this used to fake a submission with setTimeout and discard the
    // email/phone entirely - the "we'll notify you" promise was never kept.
    // Now it actually calls the server, which emails the atelier so a real
    // human can follow up when the piece restocks.
    try {
      const response = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          productName: product.name[language],
          size: selectedSize,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(
          data.error ||
            (isArabic
              ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة لاحقاً.'
              : 'Something went wrong registering your alert. Please try again.')
        );
        setLoading(false);
        return;
      }

      setLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('[LAHAB Stock Alert] Failed to submit:', err);
      setSubmitError(
        isArabic
          ? 'تعذر الاتصال بالسيرفر. يرجى المحاولة لاحقاً أو التواصل عبر واتساب.'
          : 'Could not reach the server. Please try again or reach us on WhatsApp.'
      );
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="stock-alert-modal-container"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#070E18]/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg bg-[#0D1929] border border-[#D8A065]/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ direction: isArabic ? 'rtl' : 'ltr' }}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E2E6E8]/15 flex items-center justify-between bg-[#132238]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#D8A065] flex items-center justify-center bg-[#D8A065]/10 text-[#D8A065]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading text-[10px] tracking-widest text-[#D8A065] uppercase block">
                  {isArabic ? 'تنبيه توفر الأرشيف' : 'ARCHIVE STOCK ALERT'}
                </span>
                <h3 className="font-heading text-sm sm:text-base text-[#E2E6E8] tracking-wide">
                  {isArabic ? 'أعلمني فور توفر المقاس' : 'EMAIL ME WHEN AVAILABLE'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 border border-[#E2E6E8]/30 flex items-center justify-center text-[#E2E6E8] hover:border-[#D8A065] hover:text-[#D8A065] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto border-2 border-[#D8A065] bg-[#D8A065]/15 flex items-center justify-center text-[#D8A065]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-heading text-lg sm:text-xl text-[#E2E6E8] tracking-wide">
                    {isArabic
                      ? 'تم تسجيلك بنجاح في قائمة الأولوية'
                      : 'RESTOCK ALERT CONFIRMED'}
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 max-w-sm mx-auto leading-relaxed">
                    {isArabic
                      ? `تم حفظ طلبك لمقاس (${selectedSize}) لقطعة ${product.name[language]}. ستصلك رسالة إشعار خاصة مع رابط شراء فوري فور اكتمال الحياكة في القاهرة.`
                      : `You have been placed on the priority restock queue for ${product.name[language]} in Size ${selectedSize}. We will notify ${email} the instant units are released.`}
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    onClick={onClose}
                    className="btn-lahab-primary px-8 py-3 text-xs font-bold cursor-pointer"
                  >
                    {isArabic ? 'إغلاق ومتابعة التصفح' : 'RETURN TO COLLECTION'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Product Summary */}
                <div className="p-3.5 border border-[#E2E6E8]/15 bg-[#132238]/30 flex items-center gap-4">
                  {product.editorialImage && (
                    <img
                      src={product.editorialImage}
                      alt={product.name[language]}
                      className="w-14 h-16 object-cover object-center border border-[#E2E6E8]/20 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <span className="font-heading text-[10px] text-[#D8A065] tracking-wider block">
                      {product.code}
                    </span>
                    <h4 className="font-heading text-sm text-[#E2E6E8]">
                      {product.name[language]}
                    </h4>
                    <span className="font-mono text-xs text-[#E2E6E8]/70">
                      {product.weight}
                    </span>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading text-[#D8A065] uppercase tracking-wider">
                      {isArabic ? 'اختر المقاس المطلوب لتلقي التنبيه:' : 'SELECT SIZE TO TRACK:'}
                    </span>
                    <span className="font-mono text-[11px] text-[#E2E6E8]/70">
                      {outOfStockSizes.includes(selectedSize) ? (
                        <span className="text-[#D8A065] font-bold">
                          {isArabic ? '● نفد حاليًا من الأرشيف' : '● CURRENTLY SOLD OUT'}
                        </span>
                      ) : (
                        <span className="text-emerald-400">
                          {isArabic ? 'متوفر حاليًا للشراء' : 'IN STOCK NOW'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((sz) => {
                      const isSoldOut = outOfStockSizes.includes(sz);
                      const isSelected = selectedSize === sz;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`relative py-2.5 text-xs font-heading font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] shadow-md'
                              : isSoldOut
                              ? 'border-[#E2E6E8]/30 bg-[#132238]/60 text-[#E2E6E8] hover:border-[#D8A065]/70'
                              : 'border-[#E2E6E8]/20 bg-[#0D1929] text-[#E2E6E8]/60 hover:border-[#E2E6E8]/50'
                          }`}
                        >
                          <span>{sz}</span>
                          {isSoldOut && (
                            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-[#D8A065] ring-2 ring-[#0D1929]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Restock Notice */}
                <div className="p-3 border border-[#D8A065]/30 bg-[#D8A065]/5 flex items-start gap-2.5 text-xs text-[#E2E6E8]/90 font-body">
                  <AlertTriangle className="w-4 h-4 text-[#D8A065] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {isArabic
                      ? 'جميع قطع لَهَب تُحاك بدفعات محدودة مرقمة. المشتركون في التنبيهات يحصلون على رابط الحجز الحصري قبل الطرح العام بـ 24 ساعة.'
                      : 'LAHAB pieces are milled in strictly numbered batches. Restock alert subscribers receive private booking links 24 hours before public archive drops.'}
                  </p>
                </div>

                {/* Inputs */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-heading text-[#E2E6E8]/90 uppercase tracking-wider mb-1">
                      {isArabic ? 'البريد الإلكتروني (مطلوب) *' : 'EMAIL ADDRESS (REQUIRED) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isArabic ? 'name@example.com' : 'name@example.com'}
                        className="w-full bg-[#132238]/50 border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] focus:border-[#D8A065] focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-[#E2E6E8]/40 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading text-[#E2E6E8]/90 uppercase tracking-wider mb-1">
                      {isArabic
                        ? 'رقم الواتساب / الهاتف (اختياري لتنبيه فوري)'
                        : 'WHATSAPP / PHONE (OPTIONAL FOR INSTANT NOTIFICATION)'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isArabic ? '+20 100 000 0000' : '+20 100 000 0000'}
                        className="w-full bg-[#132238]/50 border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] focus:border-[#D8A065] focus:outline-none"
                      />
                      <Phone className="w-4 h-4 text-[#E2E6E8]/40 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs font-body">
                    {submitError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-lahab-primary py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {loading
                      ? isArabic
                        ? 'جاري التسجيل...'
                        : 'REGISTERING IN ARCHIVE...'
                      : isArabic
                      ? `سجّل لتنبيه توفر مقاس (${selectedSize})`
                      : `SIGN UP FOR SIZE ${selectedSize} ALERT`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StockAlertModal;
