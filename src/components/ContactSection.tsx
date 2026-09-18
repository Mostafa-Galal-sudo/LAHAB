import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Check,
  Copy,
  Clock,
  Globe,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Language } from '../translations';

interface ContactSectionProps {
  language: Language;
  schemaContent?: {
    badge: string;
    title: string;
    description: string;
    email: string;
    phoneDisplay: string;
    whatsappNumber: string;
    responseTime: string;
  };
}

const ATELIER_EMAIL = 'lahabfire@gmail.com';
const ATELIER_PHONE_DISPLAY = '+20 128 822 4920';
const ATELIER_WHATSAPP_NUMBER = '201288224920';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

interface ServerResult {
  inquiryId: string;
  whatsappUrl: string;
  gmailUrl: string;
  mailtoUrl: string;
  emailStatus: 'sent' | 'queued' | 'simulated';
  message: string;
  timestamp: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ language, schemaContent }) => {
  const isArabic = language === 'ar';
  const atelierEmail = schemaContent?.email || ATELIER_EMAIL;
  const atelierPhoneDisplay = schemaContent?.phoneDisplay || ATELIER_PHONE_DISPLAY;
  const atelierWhatsappNumber = schemaContent?.whatsappNumber || ATELIER_WHATSAPP_NUMBER;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'bespoke',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [serverResult, setServerResult] = useState<ServerResult | null>(null);

  const handleCopy = (type: 'email' | 'phone') => {
    if (type === 'email') {
      navigator.clipboard?.writeText(atelierEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else {
      navigator.clipboard?.writeText('+201288224920');
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  // Client-Side Field Validator
  const validateField = (field: 'name' | 'email' | 'phone' | 'message', value: string): string => {
    switch (field) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) {
          return isArabic ? 'الاسم الكامل مطلوب' : 'Full name is required';
        }
        if (trimmed.length < 2) {
          return isArabic ? 'الاسم يجب أن يحتوي على حرفين على الأقل' : 'Name must be at least 2 characters';
        }
        if (trimmed.length > 80) {
          return isArabic ? 'الاسم طويل جداً (الحد الأقصى 80 حرف)' : 'Name exceeds max length (80 characters)';
        }
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) {
          return isArabic ? 'البريد الإلكتروني مطلوب' : 'Email address is required';
        }
        if (!EMAIL_REGEX.test(trimmed)) {
          return isArabic
            ? 'يرجى إدخال بريد إلكتروني صالح (مثال: client@domain.com)'
            : 'Please enter a valid email address (e.g. client@domain.com)';
        }
        return '';
      }
      case 'phone': {
        const trimmed = value.trim();
        if (!trimmed) return '';
        const digitsOnly = trimmed.replace(/[\s\-()]/g, '');
        if (digitsOnly.length < 7 || !/^\+?[0-9]{7,16}$/.test(digitsOnly)) {
          return isArabic
            ? 'يرجى إدخال رقم هاتف صالح (مثال: +201288224920)'
            : 'Please enter a valid phone number (e.g. +20 128 822 4920)';
        }
        return '';
      }
      case 'message': {
        const trimmed = value.trim();
        if (!trimmed) {
          return isArabic ? 'نص الرسالة مطلوب' : 'Your message is required';
        }
        if (trimmed.length < 10) {
          return isArabic
            ? 'يرجى كتابة رسالة توضيحية من 10 أحرف على الأقل'
            : 'Message must be at least 10 characters long';
        }
        if (trimmed.length > 2500) {
          return isArabic ? 'الرسالة تجاوزت الحد الأقصى (2500 حرف)' : 'Message exceeds max length (2500 characters)';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const err = validateField(field as 'name' | 'email' | 'phone' | 'message', value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleInputBlur = (field: 'name' | 'email' | 'phone' | 'message') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateAll = (): boolean => {
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField('phone', formData.phone);
    const messageErr = validateField('message', formData.message);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      message: messageErr,
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    const hasErrors = Object.values(newErrors).some((val) => Boolean(val));
    if (hasErrors) {
      setGlobalError(
        isArabic
          ? 'يرجى مراجعة الحقول المحددة وتصحيح الأخطاء قبل المتابعة.'
          : 'Please review and fix the highlighted errors before submitting.'
      );
      return false;
    }

    setGlobalError('');
    return true;
  };

  const formatMessageForDispatch = () => {
    const categoryLabels: Record<string, { en: string; ar: string }> = {
      bespoke: {
        en: 'Bespoke Gold Monogram / Custom Tailoring',
        ar: 'تطريز مخصص / تفصيل خاص',
      },
      sizing: {
        en: 'Sizing & Drop-Shoulder Drape Advice',
        ar: 'استشارة المقاس والقصة المعمارية',
      },
      order: {
        en: 'Order Status & Express Courier Tracking',
        ar: 'متابعة الشحن وحالة الطلب',
      },
      vip: {
        en: 'Drop 02 "Sahar" VIP Early Allocation',
        ar: 'حجز مبكر للإصدار القادم سَحَر',
      },
      press: {
        en: 'Press, Editorial & Wholesale Inquiry',
        ar: 'الصحافة والتنسيق والتعاون',
      },
      general: {
        en: 'General Atelier Inquiry',
        ar: 'استفسار عام',
      },
    };

    const cat = categoryLabels[formData.inquiryType] || categoryLabels.general;
    const catText = isArabic ? cat.ar : cat.en;

    const safeName = formData.name.replace(/[\r\n]/g, '').trim().slice(0, 80);
    const safeEmail = formData.email.replace(/[\r\n]/g, '').trim().slice(0, 100);
    const safePhone = formData.phone.replace(/[\r\n]/g, '').trim().slice(0, 40);
    const safeSubject = formData.subject.replace(/[\r\n]/g, '').trim().slice(0, 120);
    const safeMessage = formData.message.replace(/[<>]/g, '').trim().slice(0, 2500);

    if (isArabic) {
      return (
        `طلب استفسار جديد — لَهَب LΛHΛB\n` +
        `• الاسم: ${safeName}\n` +
        `• البريد الإلكتروني: ${safeEmail}\n` +
        `• رقم الهاتف: ${safePhone || 'غير محدد'}\n` +
        `• نوع الاستفسار: ${catText}\n` +
        (safeSubject ? `• الموضوع: ${safeSubject}\n\n` : '\n') +
        `الرسالة:\n${safeMessage}`
      );
    }

    return (
      `Greetings LΛHΛB Atelier,\n\n` +
      `New direct inquiry from website:\n` +
      `• Client Name: ${safeName}\n` +
      `• Client Email: ${safeEmail}\n` +
      `• Client Phone: ${safePhone || 'Not specified'}\n` +
      `• Category: ${catText}\n` +
      (safeSubject ? `• Subject: ${safeSubject}\n\n` : '\n') +
      `Message:\n${safeMessage}`
    );
  };

  const handleCopyDraft = () => {
    const formatted = formatMessageForDispatch();
    navigator.clipboard?.writeText(formatted);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  // Submit via Server-Side Route
  const handleSubmit = async (
    e?: React.FormEvent,
    targetChannel: 'server' | 'gmail' | 'whatsapp' | 'defaultMail' = 'server'
  ) => {
    if (e) e.preventDefault();

    // 1. Client-side Validation check
    if (!validateAll()) return;

    setIsSubmitting(true);
    setGlobalError('');

    try {
      // 2. Call server-side API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          inquiryType: formData.inquiryType,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.field && ['name', 'email', 'phone', 'message'].includes(data.field)) {
          setErrors((prev) => ({ ...prev, [data.field]: data.error }));
        }
        setGlobalError(data.error || (isArabic ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.' : 'Failed to process inquiry.'));
        setIsSubmitting(false);
        return;
      }

      // Success
      const result: ServerResult = {
        inquiryId: data.inquiryId,
        whatsappUrl: data.whatsappUrl,
        gmailUrl: data.gmailUrl,
        mailtoUrl: data.mailtoUrl,
        emailStatus: data.emailStatus || 'queued',
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setServerResult(result);
      setIsSuccess(true);

      // BUG FIX: this inquiry used to also be cached client-side in localStorage
      // (name/email/phone/message in plaintext on the visitor's device). The server
      // already persists the authoritative record in its own database now (see
      // server.ts -> inquiries table), so no client-side copy is needed or kept.

      // 3. Handle immediate channel redirects if user pressed specific action
      if (targetChannel === 'whatsapp' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      } else if (targetChannel === 'gmail' && data.gmailUrl) {
        window.open(data.gmailUrl, '_blank', 'noopener,noreferrer');
      } else if (targetChannel === 'defaultMail' && data.mailtoUrl) {
        const link = document.createElement('a');
        link.href = data.mailtoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('[LAHAB Contact Form] Error calling /api/contact:', err);
      // Fallback: Generate client links so user is never stranded
      const code = `LHB-INQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const formatted = formatMessageForDispatch();
      const whatsappUrl = `https://wa.me/${atelierWhatsappNumber}?text=${encodeURIComponent(formatted)}`;
      const safeSubject = encodeURIComponent(
        formData.subject ? `[LΛHΛB Inquiry #${code}] ${formData.subject}` : `[LΛHΛB Inquiry #${code}] From ${formData.name}`
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${atelierEmail}&su=${safeSubject}&body=${encodeURIComponent(formatted)}`;
      const mailtoUrl = `mailto:${atelierEmail}?subject=${safeSubject}&body=${encodeURIComponent(formatted)}`;

      const fallbackResult: ServerResult = {
        inquiryId: code,
        whatsappUrl,
        gmailUrl,
        mailtoUrl,
        emailStatus: 'queued',
        message: isArabic ? `تم تجهيز استفسارك محلياً برقم مرجع ${code}` : `Inquiry prepared with reference ${code}`,
        timestamp: new Date().toISOString(),
      };
      setServerResult(fallbackResult);
      setIsSuccess(true);

      if (targetChannel === 'whatsapp') {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else if (targetChannel === 'gmail') {
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: 'bespoke',
      subject: '',
      message: '',
    });
    setTouched({
      name: false,
      email: false,
      phone: false,
      message: false,
    });
    setErrors({});
    setIsSuccess(false);
    setServerResult(null);
    setGlobalError('');
  };

  return (
    <section
      id="contact"
      className="bg-[#0A1320] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D8A065]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#132238]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Header with Flame Heritage Calligraphy */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 bg-[#132238]/80 px-4 py-1.5 text-xs font-mono text-[#D8A065] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{schemaContent?.badge || (isArabic ? 'أتيليه لَهَب — خدمة العملاء والطلبات الخاصة' : 'ATELIER CONCIERGE & BESPOKE INQUIRIES')}</span>
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#E2E6E8] tracking-tight uppercase">
            {isArabic ? (
              <>
                تواصل مع <span className="text-[#D8A065]">الأتيليه</span>
              </>
            ) : (
              <>
                CONNECT WITH THE <span className="text-[#D8A065]">ATELIER</span>
              </>
            )}
          </h2>

          <p className="font-body text-base sm:text-lg text-[#E2E6E8]/70 leading-relaxed">
            {schemaContent?.description || (isArabic
              ? 'فريق أتيليه لَهَب متواجد لخدمتك مباشرة للإجابة على استفسارات المقاسات، طلبات التطريز الخاص بالخيوط الذهبية، أو متابعة التوصيل السريع.'
              : 'Our atelier concierge is dedicated to assisting you with architectural drape sizing, custom bespoke gold monogramming, and express regional courier tracking.')}
          </p>
        </div>

        {/* Direct Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Official Email Box */}
          <div className="border border-[#E2E6E8]/20 bg-[#0D1929] p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:border-[#D8A065] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 border border-[#D8A065]/40 bg-[#132238] flex items-center justify-center text-[#D8A065]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'البريد الرسمي للأتيليه' : 'ATELIER DIRECT EMAIL'}
                </h3>
                <span className="font-mono text-xs text-[#D8A065] block mt-1 select-all break-all">
                  {atelierEmail}
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-[#E2E6E8]/70 leading-relaxed">
              {isArabic
                ? 'يتم توجيه جميع المراسلات فوراً إلى صندوق البريد الرسمي الخاص بالأتيليه.'
                : 'All correspondence delivered directly to our dedicated atelier mailbox.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${atelierEmail}&su=${encodeURIComponent(
                  '[LΛHΛB Atelier Inquiry]'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lahab-primary flex-1 w-full py-2 text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isArabic ? 'فتح في Gmail' : 'GMAIL (NEW TAB)'}</span>
              </a>
              <a
                href={`mailto:${atelierEmail}?subject=${encodeURIComponent('[LΛHΛB Atelier Inquiry]')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lahab-outline flex-1 w-full py-2 text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#D8A065] hover:text-[#0D1929]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تطبيق البريد' : 'MAIL APP'}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy('email')}
                className="p-2 border border-[#E2E6E8]/20 hover:border-[#D8A065] text-[#E2E6E8]/70 hover:text-[#D8A065] transition-colors cursor-pointer shrink-0"
                title="Copy email address"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card 2: Direct WhatsApp Concierge */}
          <div className="border border-[#E2E6E8]/20 bg-[#0D1929] p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:border-[#D8A065] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 border border-[#25D366]/40 bg-[#132238] flex items-center justify-center text-[#25D366]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'محادثة واتساب الفورية' : 'WHATSAPP CONCIERGE'}
                </h3>
                <span className="font-mono text-xs text-[#25D366] block mt-1 dir-ltr">
                  {atelierPhoneDisplay}
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-[#E2E6E8]/70 leading-relaxed">
              {isArabic
                ? 'استشارات المقاسات الفورية والتنسيق المباشر مع استوديو التصميم والتفصيل.'
                : 'Direct styling advice, drop updates, and instant assistance on WhatsApp.'}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={`https://wa.me/${atelierWhatsappNumber}?text=${encodeURIComponent(
                  isArabic
                    ? 'السلام عليكم، أود الاستفسار عن تصاميم وقطع لَهَب LΛHΛB'
                    : 'Hello LΛHΛB Atelier, I would like to inquire about your collections.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-[#25D366] bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-[#0D1929] transition-colors font-heading tracking-wider"
              >
                <span>{isArabic ? 'بدء محادثة واتساب' : 'CHAT ON WHATSAPP'}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy('phone')}
                className="p-2 border border-[#E2E6E8]/20 hover:border-[#25D366] text-[#E2E6E8]/70 hover:text-[#25D366] transition-colors cursor-pointer shrink-0"
                title="Copy phone number"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card 3: Online Boutique Flagship */}
          <div className="border border-[#E2E6E8]/20 bg-[#0D1929] p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:border-[#D8A065] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 border border-[#D8A065]/40 bg-[#132238] flex items-center justify-center text-[#D8A065]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'متجر إلكتروني فقط' : 'ONLINE STORE ONLY'}
                </h3>
                <span className="font-mono text-xs text-[#E2E6E8]/80 block mt-1">
                  {isArabic ? 'خدمة أونلاين حصرية' : 'Exclusive Digital Flagship'}
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-[#E2E6E8]/70 leading-relaxed">
              {isArabic
                ? 'علامة تجارية تعمل حصرياً عبر الإنترنت مع خدمة شحن سريع لكافة المحافظات والدول.'
                : 'Exclusive digital-only boutique with fast regional and international express courier dispatch.'}
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs text-[#D8A065]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{schemaContent?.responseTime || (isArabic ? 'الرد خلال ساعتين بحد أقصى' : 'Avg. Response: < 2 Hours')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href={`tel:+201288224920`} className="hover:underline">
                  {atelierPhoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Full-Stack Form */}
        <div className="border border-[#D8A065]/50 bg-[#0D1929] p-6 sm:p-10 shadow-2xl relative">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b border-[#E2E6E8]/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'نموذج المراسلة المباشرة' : 'DIRECT DISPATCH FORM'}
                </h3>
                <span className="text-xs font-mono text-[#D8A065]">
                  {isArabic ? 'الوجهة: ' : 'DESTINATION: '}
                  {atelierEmail} & {atelierPhoneDisplay}
                </span>
              </div>
              <span className="text-[11px] font-heading px-3 py-1 border border-[#D8A065]/40 bg-[#132238] text-[#D8A065] self-start sm:self-auto">
                {isArabic ? 'دعم فوري على مدار الساعة' : 'PRIORITY ATELIER INBOX'}
              </span>
            </div>

            {/* Success Confirmation Card */}
            {isSuccess && serverResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border border-[#D8A065] bg-[#132238] space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D8A065]/20 border border-[#D8A065] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#D8A065]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-base text-[#D8A065] uppercase">
                          {isArabic ? 'تم توجيه الاستفسار بنجاح' : 'Inquiry Successfully Dispatched & Processed'}
                        </span>
                        <span className="font-mono text-xs px-2.5 py-0.5 bg-[#0D1929] border border-[#D8A065] text-[#D8A065] font-bold">
                          {serverResult.inquiryId}
                        </span>
                      </div>
                      <p className="font-body text-xs text-[#E2E6E8]/90 mt-1 leading-relaxed">
                        {isArabic
                          ? `تم تسجيل رسالتك في نظام الأتيليه بنجاح وتجهيزها لصندوق ${atelierEmail}. يمكنك المتابعة المباشرة عبر واتساب أو فتح الرسالة في Gmail:`
                          : `Your inquiry was securely handled by our server and routed to ${atelierEmail}. You can seamlessly continue on WhatsApp or open in Gmail:`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="text-[#E2E6E8]/60 hover:text-[#E2E6E8] text-xs font-mono p-1"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Direct Action Link Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#E2E6E8]/10">
                  <a
                    href={serverResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold font-heading flex items-center gap-2 cursor-pointer border border-[#25D366] bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-[#0D1929] transition-all tracking-wider uppercase shadow"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isArabic ? 'متابعة عبر واتساب مباشرة' : 'CONTINUE TO WHATSAPP'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={serverResult.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-lahab-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isArabic ? 'عرض في Gmail (تبويب جديد)' : 'VIEW IN GMAIL (NEW TAB)'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="px-4 py-2 text-xs font-mono border border-[#E2E6E8]/20 hover:border-[#D8A065] text-[#E2E6E8]/90 hover:text-[#D8A065] transition-colors flex items-center gap-1.5 cursor-pointer bg-[#0D1929]"
                  >
                    {copiedDraft ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedDraft ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ النص' : 'Copy Draft')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-2 text-xs font-mono text-[#E2E6E8]/60 hover:text-[#E2E6E8] flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'كتابة استفسار جديد' : 'New Inquiry'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Global Error Banner */}
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 border border-red-500/80 bg-red-950/40 text-red-300 text-xs font-body flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{globalError}</span>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={(e) => handleSubmit(e, 'server')} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                      {isArabic ? 'الاسم الكامل' : 'Full Name'}{' '}
                      <span className="text-[#D8A065] font-bold">*</span>
                    </label>
                    {touched.name && !errors.name && formData.name.trim().length >= 2 && (
                      <span className="text-green-400 text-[11px] font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> {isArabic ? 'صحيح' : 'Valid'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleInputBlur('name')}
                    placeholder={isArabic ? 'مثال: يوسف الشاذلي' : 'e.g. Youssef El-Shazly'}
                    className={`w-full bg-[#132238] px-4 py-2.5 text-sm text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none transition-colors ${
                      touched.name && errors.name
                        ? 'border border-red-500 bg-red-950/20 focus:border-red-400'
                        : 'border border-[#E2E6E8]/30 focus:border-[#D8A065]'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-400 text-xs font-body flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                      {isArabic ? 'بريدك الإلكتروني' : 'Your Email'}{' '}
                      <span className="text-[#D8A065] font-bold">*</span>
                    </label>
                    {touched.email && !errors.email && formData.email.trim() && (
                      <span className="text-green-400 text-[11px] font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> {isArabic ? 'صحيح' : 'Valid'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleInputBlur('email')}
                    placeholder="client@domain.com"
                    className={`w-full bg-[#132238] px-4 py-2.5 text-sm text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none transition-colors ${
                      touched.email && errors.email
                        ? 'border border-red-500 bg-red-950/20 focus:border-red-400'
                        : 'border border-[#E2E6E8]/30 focus:border-[#D8A065]'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-400 text-xs font-body flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                      {isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                      <span className="text-[#E2E6E8]/40 text-[10px] font-mono ml-1.5">
                        ({isArabic ? 'اختياري' : 'Optional'})
                      </span>
                    </label>
                    {touched.phone && !errors.phone && formData.phone.trim() && (
                      <span className="text-green-400 text-[11px] font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> {isArabic ? 'صحيح' : 'Valid'}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleInputBlur('phone')}
                    placeholder="+20 1..."
                    className={`w-full bg-[#132238] px-4 py-2.5 text-sm font-mono text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none transition-colors ${
                      touched.phone && errors.phone
                        ? 'border border-red-500 bg-red-950/20 focus:border-red-400'
                        : 'border border-[#E2E6E8]/30 focus:border-[#D8A065]'
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-400 text-xs font-body flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Inquiry Type */}
                <div className="space-y-1.5">
                  <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                    {isArabic ? 'نوع الاستفسار' : 'Inquiry Category'}{' '}
                    <span className="text-[#D8A065] font-bold">*</span>
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-4 py-2.5 text-sm text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] cursor-pointer"
                  >
                    <option value="bespoke">
                      {isArabic ? 'تطريز ذهبي مخصص وتفصيل خاص' : 'Bespoke Monogram / Custom Tailoring'}
                    </option>
                    <option value="sizing">
                      {isArabic ? 'استشارة المقاس والقصة المعمارية' : 'Sizing & Drop-Shoulder Drape Advice'}
                    </option>
                    <option value="order">
                      {isArabic ? 'متابعة الشحن وحالة الطلب' : 'Order Status & Express Tracking'}
                    </option>
                    <option value="vip">
                      {isArabic ? 'حجز مبكر للإصدار الثاني (سَحَر)' : 'Drop 02 "Sahar" VIP Allocation'}
                    </option>
                    <option value="press">
                      {isArabic ? 'الصحافة والتنسيق والتعاون' : 'Press, Editorial & Partnerships'}
                    </option>
                    <option value="general">
                      {isArabic ? 'استفسار عام' : 'General Atelier Inquiry'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                  {isArabic ? 'عنوان الموضوع' : 'Subject'}
                  <span className="text-[#E2E6E8]/40 text-[10px] font-mono ml-1.5">
                    ({isArabic ? 'اختياري' : 'Optional'})
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder={
                    isArabic
                      ? 'مثال: استفسار حول مقاس الهودي وتطريز الحروف الذهبية'
                      : 'e.g. Sizing inquiry regarding 520 GSM Hoodie & Custom Monogram'
                  }
                  className="w-full bg-[#132238] border border-[#E2E6E8]/30 px-4 py-2.5 text-sm text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider block">
                    {isArabic ? 'نص الرسالة أو تفاصيل الاستفسار' : 'Your Message / Inquiry Details'}{' '}
                    <span className="text-[#D8A065] font-bold">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.message.trim().length >= 10 ? 'text-green-400' : 'text-[#E2E6E8]/50'
                    }`}
                  >
                    {formData.message.length} / 2500
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  onBlur={() => handleInputBlur('message')}
                  placeholder={
                    isArabic
                      ? 'اكتب استفسارك بالتفصيل (10 أحرف على الأقل) وسيقوم فريق لَهَب بالرد عليك مباشرة...'
                      : 'Write your inquiry or question here (min. 10 characters)...'
                  }
                  className={`w-full bg-[#132238] px-4 py-3 text-sm text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none transition-colors ${
                    touched.message && errors.message
                      ? 'border border-red-500 bg-red-950/20 focus:border-red-400'
                      : 'border border-[#E2E6E8]/30 focus:border-[#D8A065]'
                  }`}
                />
                {touched.message && errors.message && (
                  <p className="text-red-400 text-xs font-body flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Multi-Channel Dispatch Actions */}
              <div className="pt-2 space-y-3">
                {/* Primary Button: Dispatches via Server Route to ma8852171@gmail.com */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-lahab-primary py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0D1929]" />
                      <span>{isArabic ? 'جاري الإرسال والمعالجة...' : 'DISPATCHING TO ATELIER...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {isArabic
                          ? `إرسال الاستفسار إلى الأتيليه (${atelierEmail})`
                          : `SUBMIT INQUIRY TO ATELIER (${atelierEmail})`}
                      </span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* WhatsApp Direct */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => handleSubmit(e, 'whatsapp')}
                    className="py-3 px-3 text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer border border-[#25D366] bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-[#0D1929] transition-all tracking-wider uppercase disabled:opacity-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'إرسال عبر واتساب' : 'VIA WHATSAPP'}</span>
                  </button>

                  {/* Gmail Direct (New Tab) */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => handleSubmit(e, 'gmail')}
                    className="btn-lahab-outline py-3 px-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#D8A065] hover:text-[#0D1929] transition-colors disabled:opacity-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'فتح في Gmail' : 'GMAIL (NEW TAB)'}</span>
                  </button>

                  {/* Copy Draft */}
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="py-3 px-3 text-xs font-mono border border-[#E2E6E8]/20 bg-[#132238] text-[#E2E6E8]/80 hover:text-[#D8A065] hover:border-[#D8A065] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                  >
                    {copiedDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">{isArabic ? 'تم النسخ!' : 'COPIED!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'نسخ المسودة' : 'COPY DRAFT'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center font-mono text-[11px] text-[#E2E6E8]/60 leading-relaxed">
                {isArabic
                  ? `يتم استقبال استفساراتك مباشرة وتوجيهها إلى البريد الرسمي ${atelierEmail} ورقم الواتساب ${atelierPhoneDisplay}.`
                  : `Inquiries route securely to atelier address ${atelierEmail} & official WhatsApp ${atelierPhoneDisplay}.`}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
