import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Truck, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { TranslationSchema, Language } from '../translations';

interface FaqSectionProps {
  t: TranslationSchema['faq'];
  language: Language;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  shipping: <Truck className="w-4 h-4 text-[#D8A065]" />,
  care: <Sparkles className="w-4 h-4 text-[#D8A065]" />,
  origin: <ShieldCheck className="w-4 h-4 text-[#D8A065]" />,
  sizing: <HelpCircle className="w-4 h-4 text-[#D8A065]" />,
};

export const FaqSection: React.FC<FaqSectionProps> = ({ t, language }) => {
  // Default first item expanded for immediate discovery
  const [expandedId, setExpandedId] = useState<string | null>('shipping');
  const isArabic = language === 'ar';

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E2E6E8]/15 relative"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3"
      >
        <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 bg-[#132238]/60 px-3.5 py-1 text-xs font-mono text-[#D8A065] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-[#D8A065]" />
          <span>{t.badge}</span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#E2E6E8] tracking-tight uppercase">
          {t.title}
        </h2>

        <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 leading-relaxed">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Compact Accordion Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="space-y-3 max-w-4xl mx-auto"
      >
        {t.items.map((item, index) => {
          const isOpen = expandedId === item.id;
          const icon = CATEGORY_ICONS[item.id] || <HelpCircle className="w-4 h-4 text-[#D8A065]" />;

          return (
            <div
              key={item.id}
              id={`faq-accordion-item-${item.id}`}
              className={`border transition-all duration-300 glass-card-luxury ${
                isOpen
                  ? 'border-[#D8A065] shadow-[0_0_25px_rgba(216,160,101,0.18)]'
                  : 'border-[#E2E6E8]/20 hover:border-[#D8A065]/50'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                id={`faq-trigger-${item.id}`}
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer transition-colors bg-[#132238]/40 hover:bg-[#132238]/70"
                style={{ textAlign: isArabic ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 pr-3">
                  <div
                    className={`w-8 h-8 rounded-none border flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'border-[#D8A065] bg-[#D8A065]/10 text-[#D8A065]'
                        : 'border-[#E2E6E8]/30 bg-[#0D1929] text-[#E2E6E8]/60'
                    }`}
                  >
                    {icon}
                  </div>

                  <div className="space-y-1">
                    <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="font-heading text-sm sm:text-base text-[#E2E6E8] tracking-wide">
                      {item.question}
                    </h3>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 border flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen
                      ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] rotate-180'
                      : 'border-[#E2E6E8]/30 text-[#E2E6E8] rotate-0'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Accordion Expandable Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-6 pt-2 sm:pt-3 text-xs sm:text-sm text-[#E2E6E8]/85 font-body leading-relaxed border-t border-[#E2E6E8]/10 bg-[#0D1929]">
                      <p className="border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#D8A065] pl-3.5 rtl:pl-0 rtl:pr-3.5 py-1">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* Optional Concierge Assistance Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-10 p-5 sm:p-6 border border-[#E2E6E8]/20 bg-[#132238]/40 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
        style={{ textAlign: isArabic ? 'right' : undefined }}
      >
        <div className="space-y-1">
          <span className="font-heading text-[11px] tracking-widest text-[#D8A065] uppercase block">
            {isArabic ? 'خدمة عملاء لَهَب الحصرية' : 'LAHAB CLIENT CONCIERGE'}
          </span>
          <p className="text-xs text-[#E2E6E8]/80">
            {isArabic
              ? 'هل لديك استفسار خاص عن المقاسات، الدفع، أو توصيل الطلبات الخاصة؟'
              : 'Have a bespoke question regarding custom sizing, courier dispatch, or archive drops?'}
          </p>
        </div>

        <a
          href="https://wa.me/?text=Hello%20LAHAB%20Concierge,%20I%20have%20an%20inquiry%20regarding%20Drop%2001."
          target="_blank"
          rel="noopener noreferrer"
          className="btn-lahab-primary px-6 py-2.5 text-xs font-bold whitespace-nowrap inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>💬</span>
          <span>{isArabic ? 'تواصل عبر واتساب' : 'WHATSAPP CONCIERGE'}</span>
        </a>
      </motion.div>
    </section>
  );
};

export default FaqSection;
