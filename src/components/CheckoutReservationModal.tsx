import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CreditCard, Banknote, Smartphone, Check, ShieldCheck, MapPin, Truck, Mail, Send, Loader2, Sparkles, AlertCircle, Copy, CheckCircle2, Wallet } from 'lucide-react';
import { CartItem } from '../types';
import { Language } from '../translations';
import Wordmark from './Wordmark';
import { GlossyCard } from './GlossyCard';

interface CheckoutReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  language: Language;
  onSuccessReset: () => void;
}

// Mobile wallet numbers to send Vodafone Cash / Orange Cash transfers to.
// EDIT THESE if your actual wallet numbers differ from the main atelier line.
const VODAFONE_CASH_NUMBER = '01288224920';
const ORANGE_CASH_NUMBER = '01288224920';

// Client-side mirror of worker/routes/contact.ts's COUPON_DISCOUNTS, used
// only to show the user a preview before submitting. The server independently
// re-validates the code and computes the real discount - this list is not
// itself a security boundary, it's just so the UI can show an error for an
// obviously-wrong code before the request round-trips.
const KNOWN_COUPONS: Record<string, number> = {
  LAHABLTD: 15,
  VIP15: 15,
  DROP02: 15,
  DROP01: 10,
  FIRE10: 10,
};

const EGYPT_GOVERNORATES = [
  { en: 'Cairo (Next-Day Courier)', ar: 'القاهرة (شحن سريع اليوم التالي)' },
  { en: 'Giza (Next-Day Courier)', ar: 'الجيزة (شحن سريع اليوم التالي)' },
  { en: 'New Cairo & 5th Settlement', ar: 'القاهرة الجديدة والتجمع' },
  { en: 'Sheikh Zayed & 6th of October', ar: 'الشيخ زايد والسادس من أكتوبر' },
  { en: 'Alexandria', ar: 'الإسكندرية' },
  { en: 'Red Sea & El Gouna', ar: 'البحر الأحمر والجونة' },
  { en: 'Mansoura & Dakahlia', ar: 'المنصورة والدقهلية' },
  { en: 'Tanta & Gharbia', ar: 'طنطا والغربية' },
  { en: 'Port Said & Ismailia', ar: 'بورسعيد والإسماعيلية' },
  { en: 'Other Governorate (Rest of Egypt)', ar: 'باقي محافظات مصر' },
];

const GCC_COUNTRIES = [
  { en: 'Saudi Arabia (Riyadh, Jeddah, Dammam)', ar: 'المملكة العربية السعودية' },
  { en: 'United Arab Emirates (Dubai, Abu Dhabi)', ar: 'الإمارات العربية المتحدة' },
  { en: 'Kuwait (Kuwait City, Hawalli)', ar: 'دولة الكويت' },
  { en: 'Qatar (Doha, Lusail)', ar: 'دولة قطر' },
  { en: 'Bahrain (Manama, Riffa)', ar: 'مملكة البحرين' },
  { en: 'Oman (Muscat)', ar: 'سلطنة عُمان' },
];

export const CheckoutReservationModal: React.FC<CheckoutReservationModalProps> = ({
  isOpen,
  onClose,
  items,
  language,
  onSuccessReset,
}) => {
  const isArabic = language === 'ar';

  const [regionType, setRegionType] = useState<'egypt' | 'gcc'>('egypt');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay' | 'vodafone_cash' | 'orange_cash' | 'card'>('cod');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: 'Cairo (Next-Day Courier)',
    address: '',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationCode, setReservationCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [dispatchLinks, setDispatchLinks] = useState<{
    whatsappUrl: string;
    gmailUrl: string;
    mailtoUrl: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  // BUG FIX: the checkout used to silently fall back to a fake "success"
  // screen with a client-generated reservation code whenever /api/checkout
  // failed - the order was never actually saved anywhere the merchant could
  // see it, but the customer believed it went through. Now a failed
  // submission shows a real error with a manual WhatsApp fallback instead.
  const [submitError, setSubmitError] = useState('');
  const [manualWhatsAppUrl, setManualWhatsAppUrl] = useState('');

  // Reset modal state when modal is closed
  const handleClose = () => {
    setIsSuccess(false);
    setDispatchLinks(null);
    setReservationCode('');
    onClose();
  };

  if (!isOpen) return null;

  // Calculate Subtotal including bespoke monogram charges (+350 EGP per customized piece)
  const subtotalEGP = items.reduce((sum, item) => {
    const base = item.product.priceEGP * item.quantity;
    const monogramFee = item.monogram ? 350 * item.quantity : 0;
    return sum + base + monogramFee;
  }, 0);

  // Dynamic Shipping Calculation
  const isCairoOrGiza =
    regionType === 'egypt' &&
    (formData.location.includes('Cairo') || formData.location.includes('Giza'));

  const shippingFeeEGP =
    regionType === 'gcc'
      ? 350
      : isCairoOrGiza
      ? 0
      : 50;

  const discountAmount = appliedCoupon
    ? Math.round(subtotalEGP * (appliedCoupon.discountPercent / 100))
    : 0;

  const totalEGP = Math.max(0, subtotalEGP - discountAmount + shippingFeeEGP);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponMessage({
        text: isArabic ? 'يرجى إدخال كود الكوبون' : 'Please enter a coupon code',
        type: 'error',
      });
      return;
    }

    // BUG FIX: this used to accept ANY string as a valid coupon (defaulting
    // to a 10% discount) - meaning "coupons" didn't actually gate anything.
    // Only recognized codes apply a discount now; the server independently
    // re-validates this exact list regardless of what the client shows.
    const discountPercent = KNOWN_COUPONS[cleanCode];

    if (!discountPercent) {
      setCouponMessage({
        text: isArabic ? 'هذا الكود غير صالح' : 'This coupon code is not valid',
        type: 'error',
      });
      return;
    }

    setAppliedCoupon({ code: cleanCode, discountPercent });
    setCouponMessage({
      text:
        discountPercent >= 15
          ? isArabic
            ? 'تم تفعيل خصم 15% VIP بنجاح'
            : '15% VIP Allocation discount applied'
          : isArabic
          ? 'تم تفعيل خصم 10% لإطلاق DROP 01'
          : '10% Launch discount applied',
      type: 'success',
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSubmitError('');

    if (!formData.fullName.trim()) {
      setValidationError(isArabic ? 'يرجى كتابة الاسم الكامل' : 'Please provide your full name');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setValidationError(
        isArabic
          ? 'يرجى إدخال رقم هاتف صحيح لتأكيد الحجز والتسليم'
          : 'Please enter a valid phone number for dispatch verification'
      );
      return;
    }

    if (!formData.address.trim()) {
      setValidationError(
        isArabic
          ? 'يرجى إدخال عنوان التوصيل بالتفصيل'
          : 'Please enter your delivery street address'
      );
      return;
    }

    setIsSubmitting(true);

    // SECURITY FIX: send productId per item so the server can look up real
    // prices from the database - name/code/price are no longer trusted from
    // the client (they used to be sent as free-form strings/numbers that the
    // server accepted verbatim, making the total fully tamperable).
    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      address: formData.address,
      notes: formData.notes,
      regionType,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      items: items.map((i) => ({
        productId: i.product.id,
        size: i.size,
        quantity: i.quantity,
        monogram: i.monogram ? `${i.monogram.text} (${i.monogram.placement})` : undefined,
      })),
      language,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}) as any);

      if (!res.ok || !data.success) {
        // BUG FIX: previously any failure here silently fell through to a
        // fake "success" screen with a client-made-up reservation code and
        // no real record of the order anywhere. Now we show what actually
        // happened and offer a one-tap manual WhatsApp fallback instead of
        // pretending it worked.
        setSubmitError(
          data.error ||
            (isArabic
              ? 'تعذّر إرسال طلبك. يرجى المحاولة تاني أو التواصل عبر واتساب.'
              : "We couldn't submit your order. Please try again or contact us on WhatsApp.")
        );
        if (data.whatsappUrl) {
          setManualWhatsAppUrl(data.whatsappUrl);
        } else {
          const piecesSummary = items
            .map((i) => `• ${i.product.name[language]} [${i.product.code}] | Size: ${i.size} | Qty: ${i.quantity}`)
            .join('\n');
          const msgText = isArabic
            ? `طلب حجز (تعذّر إرساله تلقائيًا) — لَهَب LΛHΛB\nالاسم: ${formData.fullName}\nالهاتف: ${formData.phone}\nالعنوان: ${formData.address}\n\nالقطع:\n${piecesSummary}`
            : `Order (auto-submit failed) — LΛHΛB\nName: ${formData.fullName}\nPhone: ${formData.phone}\nAddress: ${formData.address}\n\nItems:\n${piecesSummary}`;
          setManualWhatsAppUrl(`https://wa.me/201288224920?text=${encodeURIComponent(msgText)}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Success - use the server's authoritative, recomputed totals rather
      // than whatever this component calculated locally.
      setReservationCode(data.reservationCode);
      setDispatchLinks({
        whatsappUrl: data.whatsappUrl,
        gmailUrl: data.gmailUrl,
        mailtoUrl: data.mailtoUrl,
      });

      // Save order record locally so the client can view history on "My Orders"
      try {
        const existingHistory = JSON.parse(localStorage.getItem('lahab_order_history') || '[]');
        const newRecord = {
          id: data.reservationCode,
          timestamp: data.timestamp,
          items: items.map((i) => ({
            name: i.product.name[language] || i.product.name.en,
            code: i.product.code,
            size: i.size,
            quantity: i.quantity,
            price: i.product.priceEGP,
            monogram: i.monogram ? `${i.monogram.text} (${i.monogram.placement})` : undefined,
          })),
          totalEGP: data.totalEGP,
          paymentMethod,
          location: formData.location,
          address: formData.address,
          whatsappUrl: data.whatsappUrl,
          gmailUrl: data.gmailUrl,
        };
        localStorage.setItem('lahab_order_history', JSON.stringify([newRecord, ...existingHistory]));
      } catch {
        // non-fatal
      }

      setIsSubmitting(false);
      setIsSuccess(true);

      // Auto trigger both WhatsApp and Gmail compose windows in background
      setTimeout(() => {
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
        }
        if (data.gmailUrl) {
          setTimeout(() => {
            window.open(data.gmailUrl, '_blank', 'noopener,noreferrer');
          }, 400);
        }
      }, 600);
    } catch (err) {
      console.error('[LAHAB Checkout] Network error submitting order:', err);
      setSubmitError(
        isArabic
          ? 'تعذّر الاتصال بالسيرفر. يرجى المحاولة تاني أو التواصل عبر واتساب.'
          : 'Could not reach the server. Please try again or contact us on WhatsApp.'
      );
      const piecesSummary = items
        .map((i) => `• ${i.product.name[language]} [${i.product.code}] | Size: ${i.size} | Qty: ${i.quantity}`)
        .join('\n');
      const msgText = isArabic
        ? `طلب حجز (تعذّر إرساله تلقائيًا) — لَهَب LΛHΛB\nالاسم: ${formData.fullName}\nالهاتف: ${formData.phone}\nالعنوان: ${formData.address}\n\nالقطع:\n${piecesSummary}`
        : `Order (auto-submit failed) — LΛHΛB\nName: ${formData.fullName}\nPhone: ${formData.phone}\nAddress: ${formData.address}\n\nItems:\n${piecesSummary}`;
      setManualWhatsAppUrl(`https://wa.me/201288224920?text=${encodeURIComponent(msgText)}`);
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onSuccessReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#070D14]/90 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl bg-[#0D1929] border border-[#D8A065]/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E2E6E8]/20 bg-[#132238] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Wordmark size="sm" showMedallion={false} />
            <div className="h-4 w-[1px] bg-[#E2E6E8]/30" />
            <div>
              <span className="font-heading text-[10px] text-[#D8A065] tracking-[0.25em] uppercase block">
                {isArabic ? 'بوابة الحجز المعتمدة // EGYPT & GCC' : 'DROP 01 CHECKOUT // EGYPT & GCC'}
              </span>
              <h2 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] tracking-wide mt-0.5">
                {isArabic ? 'إتمام حجز القطع والشحن' : 'Dispatch Order & Allocation'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-[#E2E6E8]/70 hover:text-[#D8A065] border border-transparent hover:border-[#D8A065]/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isSuccess ? (
            /* =================== SUCCESS / ORDER CONFIRMATION VIEW =================== */
            <div className="max-w-2xl mx-auto text-center space-y-6 py-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full border-2 border-[#D8A065] flex items-center justify-center mx-auto text-[#D8A065] bg-[#132238] shadow-[0_0_35px_rgba(216,160,101,0.4)]"
              >
                <Check className="w-8 h-8" />
              </motion.div>

              <div className="space-y-2">
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {isArabic ? 'تم تسجيل وتأكيد الطلب وإرسال الإشعار للأتيليه' : 'ALLOCATION SECURED & DISPATCHED TO ATELIER'}
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'شكراً لثقتك بعلامة لَهَب' : 'YOUR PIECE IS RESERVED'}
                </h3>
              </div>

              {/* Glossy Code Card */}
              <GlossyCard className="p-6 space-y-3 max-w-lg mx-auto" glowColor="rgba(216,160,101,0.25)">
                <span className="font-heading text-xs text-[#E2E6E8]/70 uppercase tracking-wider block">
                  {isArabic ? 'كود التتبع وحجز الأرشيف الرسمي:' : 'OFFICIAL TRACKING & RESERVATION CODE:'}
                </span>
                <div className="flex items-center justify-center gap-3">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-[#D8A065] tracking-widest selection:bg-[#D8A065] selection:text-[#0D1929]">
                    {reservationCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 border border-[#D8A065]/40 hover:border-[#D8A065] text-[#D8A065] bg-[#0D1929] transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedCode && (
                  <span className="text-[10px] text-green-400 font-mono block">
                    {isArabic ? 'تم نسخ الكود للحافظة' : 'Copied code to clipboard'}
                  </span>
                )}
                <div className="text-xs text-[#E2E6E8]/80 font-body pt-3 border-t border-[#E2E6E8]/10 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D8A065] shrink-0" />
                  <span>
                    {paymentMethod === 'cod'
                      ? isArabic
                        ? 'الدفع نقداً عند الاستلام بعد معاينة جودة النسيج وتطريز الذهب.'
                        : 'Cash on Delivery with Garment & Gold Embroidery Inspection Privilege.'
                      : paymentMethod === 'instapay'
                      ? isArabic
                        ? 'يرجى تحويل المبلغ عبر InstaPay على (lahab@instapay) مع ذكر كود الطلب.'
                        : 'Please complete transfer via InstaPay to (lahab@instapay) referencing your Order Code.'
                      : paymentMethod === 'vodafone_cash'
                      ? isArabic
                        ? `يرجى تحويل المبلغ عبر فودافون كاش على ${VODAFONE_CASH_NUMBER} مع ذكر كود الطلب.`
                        : `Please transfer via Vodafone Cash to ${VODAFONE_CASH_NUMBER}, referencing your Order Code.`
                      : paymentMethod === 'orange_cash'
                      ? isArabic
                        ? `يرجى تحويل المبلغ عبر أورانج كاش على ${ORANGE_CASH_NUMBER} مع ذكر كود الطلب.`
                        : `Please transfer via Orange Cash to ${ORANGE_CASH_NUMBER}, referencing your Order Code.`
                      : isArabic
                        ? 'تم تسجيل طلبك ورقم التتبع وجارٍ التواصل معك برابط الدفع الآمن.'
                        : 'Order registered; our concierge will provide your secure card payment link.'}
                  </span>
                </div>
              </GlossyCard>

              {/* Automatic Dispatch Links Notification */}
              <div className="p-4 bg-[#132238]/60 border border-[#D8A065]/40 max-w-lg mx-auto text-xs text-[#E2E6E8]/80 space-y-1">
                <strong className="text-[#D8A065] block font-heading uppercase flex items-center justify-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {isArabic ? 'تواصل فوري مباشر عبر واتساب والبريد:' : 'DIRECT INSTANT DISPATCH CHANNELS:'}
                </strong>
                <p className="font-body">
                  {isArabic
                    ? 'تم تجهيز رسالة التوثيق بالكامل وتوجيهك لفتح محادثة المباشرة مع خدمة العملاء.'
                    : 'Your complete order details have been prepared and formatted for direct delivery confirmation.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 flex-wrap">
                {dispatchLinks?.whatsappUrl && (
                  <a
                    href={dispatchLinks.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto btn-lahab-primary px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer no-underline"
                  >
                    <span>💬</span>
                    <span>{isArabic ? 'محادثة الواتساب المباشرة' : 'OPEN WHATSAPP CONCIERGE'}</span>
                  </a>
                )}

                {dispatchLinks?.gmailUrl && (
                  <a
                    href={dispatchLinks.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto btn-lahab-outline px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#D8A065] hover:text-[#0D1929] no-underline"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isArabic ? 'تأكيد بالبريد (Gmail)' : 'SEND VIA GMAIL'}</span>
                  </a>
                )}

                <button
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-heading border border-[#E2E6E8]/20 text-[#E2E6E8]/70 hover:text-[#E2E6E8] hover:border-[#E2E6E8]/50 transition-colors cursor-pointer"
                >
                  {isArabic ? 'العودة للمتجر' : 'RETURN TO STORE'}
                </button>
              </div>
            </div>
          ) : (
            /* =================== ACTIVE CHECKOUT INTERACTION =================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Reserved Piece(s) Summary & Coupon (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="font-heading text-sm text-[#D8A065] uppercase tracking-wider pb-3 border-b border-[#E2E6E8]/20 flex items-center justify-between">
                    <span>{isArabic ? 'القطع المطلوبة' : 'ORDERED PIECES'}</span>
                    <span className="font-mono text-xs text-[#E2E6E8]/70">
                      {items.reduce((s, i) => s + i.quantity, 0)} {isArabic ? 'قطعة' : 'Item(s)'}
                    </span>
                  </h3>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <GlossyCard
                      key={`${item.product.id}-${item.size}-${item.monogram?.text || 'plain'}`}
                      className="p-4 space-y-2"
                      glowColor="rgba(216,160,101,0.18)"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-heading text-[10px] tracking-wider text-[#D8A065] block">
                            {item.product.code}
                          </span>
                          <h4 className="font-heading text-sm text-[#E2E6E8] uppercase">
                            {item.product.name[language]}
                          </h4>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="border border-[#D8A065] bg-[#0D1929] text-[#D8A065] px-2 py-0.5 text-xs font-mono font-bold">
                              {isArabic ? `المقاس: ${item.size}` : `SIZE: ${item.size}`}
                            </span>
                            <span className="text-[#E2E6E8]/60 text-xs font-mono">
                              QTY: {item.quantity}
                            </span>
                          </div>

                          {/* Monogram Badge */}
                          {item.monogram && (
                            <div className="mt-1.5 p-1.5 bg-[#0D1929] border border-[#D8A065]/40 text-[10px] font-mono text-[#D8A065] flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-[#D8A065] shrink-0" />
                              <span>BESPOKE: "{item.monogram.text}" ({item.monogram.placement.toUpperCase()})</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-sm font-bold text-[#E2E6E8] block">
                            {isArabic
                              ? `${((item.product.priceEGP + (item.monogram ? 350 : 0)) * item.quantity).toLocaleString('ar-EG')} ج.م`
                              : `${((item.product.priceEGP + (item.monogram ? 350 : 0)) * item.quantity).toLocaleString()} EGP`}
                          </span>
                        </div>
                      </div>
                    </GlossyCard>
                  ))}
                </div>

                {/* Coupon Box */}
                <GlossyCard className="p-4 space-y-3" glowColor="rgba(216,160,101,0.15)">
                  <div className="flex items-center justify-between">
                    <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                      {isArabic ? 'كوبون الخصم أو كود الدعوة' : 'PROMO CODE OR VIP PASS'}
                    </label>
                    <span className="text-[10px] text-[#E2E6E8]/60 font-mono">Try: DROP02</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#0D1929] border border-[#D8A065]">
                      <span className="font-mono text-xs font-bold text-[#D8A065]">
                        {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-[#E2E6E8]/70 hover:text-[#D8A065] font-mono cursor-pointer"
                      >
                        {isArabic ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. DROP02 / VIP15"
                        className="flex-1 bg-[#0D1929] border border-[#E2E6E8]/30 px-3 py-2 text-xs font-mono font-bold text-[#E2E6E8] uppercase focus:border-[#D8A065] outline-none"
                      />
                      <button
                        type="submit"
                        className="btn-lahab-primary px-4 py-2 text-xs font-bold cursor-pointer"
                      >
                        {isArabic ? 'تطبيق' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponMessage && (
                    <p
                      className={`text-xs ${
                        couponMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </GlossyCard>

                {/* Financial Summary */}
                <GlossyCard className="p-4 space-y-2 font-mono text-xs" glowColor="rgba(216,160,101,0.2)">
                  <div className="flex justify-between text-[#E2E6E8]/70">
                    <span>{isArabic ? 'المجموع الفرعي للقطع:' : 'Subtotal Pieces:'}</span>
                    <span>{subtotalEGP.toLocaleString()} EGP</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#D8A065]">
                      <span>{isArabic ? 'خصم الكوبون:' : 'Discount:'}</span>
                      <span>-{discountAmount.toLocaleString()} EGP</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#E2E6E8]/70">
                    <span>
                      {isArabic
                        ? `رسوم الشحن (${regionType === 'gcc' ? 'شحن جوي للخليج' : 'توصيل مصر'}):`
                        : `Shipping (${regionType === 'gcc' ? 'GCC Air Express' : 'Egypt Courier'}):`}
                    </span>
                    <span className={shippingFeeEGP === 0 ? 'text-green-400 font-bold' : ''}>
                      {shippingFeeEGP === 0 ? 'FREE' : `${shippingFeeEGP} EGP`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E2E6E8]/20 flex justify-between text-base font-bold text-[#D8A065]">
                    <span>{isArabic ? 'إجمالي الطلب:' : 'Grand Total:'}</span>
                    <span>{totalEGP.toLocaleString()} EGP</span>
                  </div>
                </GlossyCard>
              </div>

              {/* Right Column: Destination Region, Payment Methods & Delivery Form (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Destination Region Tabs (Egypt vs GCC) */}
                  <div className="space-y-2">
                    <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                      {isArabic ? '1. وجهة الشحن الإقليمية' : '1. Dispatch Destination'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRegionType('egypt');
                          setFormData({ ...formData, location: EGYPT_GOVERNORATES[0].en });
                        }}
                        className={`p-3 text-left border transition-all cursor-pointer ${
                          regionType === 'egypt'
                            ? 'border-[#D8A065] bg-[#132238] text-[#E2E6E8]'
                            : 'border-[#E2E6E8]/20 bg-[#0D1929] text-[#E2E6E8]/60 hover:border-[#D8A065]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#D8A065]" />
                          <span className="font-heading text-xs font-bold">
                            {isArabic ? 'مصر (محافظات الجمهورية)' : 'EGYPT (ALL GOVERNORATES)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#E2E6E8]/60 font-body block mt-0.5">
                          {isArabic ? 'شحن فوري سريع خلال 24-48 ساعة' : 'Next-Day Express Courier'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegionType('gcc');
                          setFormData({ ...formData, location: GCC_COUNTRIES[0].en });
                        }}
                        className={`p-3 text-left border transition-all cursor-pointer ${
                          regionType === 'gcc'
                            ? 'border-[#D8A065] bg-[#132238] text-[#E2E6E8]'
                            : 'border-[#E2E6E8]/20 bg-[#0D1929] text-[#E2E6E8]/60 hover:border-[#D8A065]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-[#D8A065]" />
                          <span className="font-heading text-xs font-bold">
                            {isArabic ? 'دول الخليج العربي (GCC)' : 'GCC COUNTRIES (EXPRESS)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#E2E6E8]/60 font-body block mt-0.5">
                          {isArabic ? 'شحن جوي دولي عبر DHL/أرامكس' : 'DHL / Aramex 3-4 Days'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                      {isArabic ? '2. طريقة الدفع المعتمدة' : '2. Payment Method'}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        {
                          id: 'cod',
                          labelEn: 'Cash on Delivery',
                          labelAr: 'الدفع عند الاستلام',
                          icon: Banknote,
                        },
                        {
                          id: 'instapay',
                          labelEn: 'InstaPay / Fawry',
                          labelAr: 'إنستاباي / فوري',
                          icon: Smartphone,
                        },
                        {
                          id: 'vodafone_cash',
                          labelEn: 'Vodafone Cash',
                          labelAr: 'فودافون كاش',
                          icon: Wallet,
                        },
                        {
                          id: 'orange_cash',
                          labelEn: 'Orange Cash',
                          labelAr: 'أورانج كاش',
                          icon: Wallet,
                        },
                        {
                          id: 'card',
                          labelEn: 'Credit / Debit Card',
                          labelAr: 'بطاقة بنكية وميزة',
                          icon: CreditCard,
                        },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as any)}
                            className={`p-3 border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              paymentMethod === pm.id
                                ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                                : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/80 hover:border-[#D8A065]/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] font-heading uppercase text-center leading-tight">
                              {isArabic ? pm.labelAr : pm.labelEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Method details banner */}
                    {paymentMethod === 'cod' && (
                      <div className="p-3 bg-[#132238]/60 border border-[#E2E6E8]/20 text-xs text-[#E2E6E8]/80 space-y-1">
                        <strong className="text-[#D8A065] block font-heading uppercase">
                          {isArabic ? 'ضمان المعاينة قبل الدفع:' : 'GARMENT INSPECTION PRIVILEGE:'}
                        </strong>
                        <p className="font-body">
                          {isArabic
                            ? 'يحق لك فتح الشحنة ومعاينة جودة النسيج وتطريز الذهب مع مندوب التوصيل قبل دفع المبلغ.'
                            : 'Inspect the 520 GSM fleece thickness and gold embroidery at your door before payment.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'instapay' && (
                      <div className="p-3 bg-[#132238]/60 border border-[#D8A065]/40 text-xs text-[#E2E6E8]/80 space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-[#D8A065]">
                          <span>INSTAPAY IPA:</span>
                          <span className="font-bold">lahab@instapay</span>
                        </div>
                        <p className="font-body text-[11px] text-[#E2E6E8]/60">
                          {isArabic
                            ? 'يتم إرسال إيصال التحويل عبر واتساب لتأكيد الشحن الفوري.'
                            : 'Send transfer screenshot to WhatsApp concierge for instant tracking release.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'vodafone_cash' && (
                      <div className="p-3 bg-[#132238]/60 border border-[#D8A065]/40 text-xs text-[#E2E6E8]/80 space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-[#D8A065]">
                          <span>{isArabic ? 'رقم فودافون كاش:' : 'VODAFONE CASH NUMBER:'}</span>
                          <span className="font-bold">{VODAFONE_CASH_NUMBER}</span>
                        </div>
                        <p className="font-body text-[11px] text-[#E2E6E8]/60">
                          {isArabic
                            ? 'حوّل المبلغ على الرقم ده، وابعت إيصال التحويل عبر واتساب لتأكيد الشحن.'
                            : 'Transfer the amount to this number and send the confirmation screenshot to WhatsApp concierge to confirm dispatch.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'orange_cash' && (
                      <div className="p-3 bg-[#132238]/60 border border-[#D8A065]/40 text-xs text-[#E2E6E8]/80 space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-[#D8A065]">
                          <span>{isArabic ? 'رقم أورانج كاش:' : 'ORANGE CASH NUMBER:'}</span>
                          <span className="font-bold">{ORANGE_CASH_NUMBER}</span>
                        </div>
                        <p className="font-body text-[11px] text-[#E2E6E8]/60">
                          {isArabic
                            ? 'حوّل المبلغ على الرقم ده، وابعت إيصال التحويل عبر واتساب لتأكيد الشحن.'
                            : 'Transfer the amount to this number and send the confirmation screenshot to WhatsApp concierge to confirm dispatch.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="p-3 bg-[#132238]/60 border border-[#D8A065]/40 flex items-start gap-2.5 text-xs text-[#E2E6E8]/80">
                        <ShieldCheck className="w-4 h-4 text-[#D8A065] shrink-0 mt-0.5" />
                        <p className="font-body leading-relaxed">
                          {isArabic
                            ? 'لأمان بياناتك، لا نطلب رقم البطاقة هنا. بعد تأكيد الحجز سيصلك رابط دفع آمن (بوابة دفع معتمدة) عبر واتساب أو البريد لإتمام العملية.'
                            : 'For your security, we never collect card details on this form. After you confirm your reservation, a secure payment link (via a licensed payment gateway) will be sent to you on WhatsApp or email to complete the transaction.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {validationError && (
                    <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs font-body flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs font-body space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                      {manualWhatsAppUrl && (
                        <a
                          href={manualWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-400/50 text-red-200 hover:bg-red-900/40 text-[11px] font-bold uppercase tracking-wide"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isArabic ? 'أرسل الطلب يدويًا عبر واتساب' : 'Send order manually via WhatsApp'}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Customer Information Form */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                        {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={isArabic ? 'مثال: كريم منصور' : 'e.g. Karim Mansour'}
                        className="w-full bg-[#132238]/60 border border-[#E2E6E8]/30 px-4 py-2.5 text-sm text-[#E2E6E8] focus:border-[#D8A065] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'رقم الهاتف للتوصيل *' : 'Phone Number *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={isArabic ? '010 1234 5678' : '+20 10 1234 5678'}
                          className="w-full bg-[#132238]/60 border border-[#E2E6E8]/30 px-4 py-2.5 text-sm font-mono text-[#E2E6E8] focus:border-[#D8A065] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                          {isArabic ? 'المدينة / المحافظة *' : 'City / Governorate *'}
                        </label>
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-3 py-2.5 text-sm text-[#E2E6E8] cursor-pointer focus:border-[#D8A065] outline-none"
                        >
                          {(regionType === 'egypt' ? EGYPT_GOVERNORATES : GCC_COUNTRIES).map((loc) => (
                            <option key={loc.en} value={loc.en} className="bg-[#0D1929] text-[#E2E6E8]">
                              {isArabic ? loc.ar : loc.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                        {isArabic ? 'عنوان الشارع بالتفصيل *' : 'Street Delivery Address *'}
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder={
                          isArabic
                            ? 'اسم الشارع، رقم العمارة، الشقة، وأقرب علامة مميزة'
                            : 'Street name, building number, apartment, landmark'
                        }
                        className="w-full bg-[#132238]/60 border border-[#E2E6E8]/30 px-4 py-2 text-sm text-[#E2E6E8] focus:border-[#D8A065] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-heading text-xs text-[#E2E6E8]/70 uppercase tracking-wider block">
                        {isArabic ? 'البريد الإلكتروني (اختياري لاستلام الفاتورة)' : 'Email Address (Optional)'}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@example.com"
                        className="w-full bg-[#132238]/40 border border-[#E2E6E8]/20 px-4 py-2 text-sm text-[#E2E6E8] focus:border-[#D8A065] outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full btn-lahab-primary py-4 text-xs font-bold flex items-center justify-center gap-3 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isArabic ? 'جارٍ تأكيد وتسجيل الطلب...' : 'DISPATCHING ARCHIVAL ORDER...'}</span>
                      </span>
                    ) : (
                      <span>
                        {isArabic
                          ? `تأكيد الطلب والإرسال (${totalEGP.toLocaleString('ar-EG')} ج.م)`
                          : `CONFIRM & DISPATCH ORDER (${totalEGP.toLocaleString()} EGP)`}
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutReservationModal;
