import React from 'react';
import { motion } from 'motion/react';
import { TranslationSchema, Language } from '../translations';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';

interface EditorialLookbookProps {
  t: TranslationSchema['editorial'];
  language: Language;
  onOpenSizingModal: () => void;
  schemaCards?: Array<{ title: string; description: string; image: string }>;
}

const cardsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.12,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const EditorialLookbook: React.FC<EditorialLookbookProps> = ({
  t,
  language,
  onOpenSizingModal,
  schemaCards,
}) => {
  const isArabic = language === 'ar';
  const frontCard = schemaCards?.[0];
  const backCard = schemaCards?.[1];

  return (
    <section
      id="lookbook"
      className="bg-[#0D1929] text-[#E2E6E8] px-6 sm:px-10 lg:px-16 py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header with scroll entrance */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 bg-[#D8A065]" />
            <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
              {t.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-8">
              <h2 className="font-heading text-3xl sm:text-5xl text-[#D8A065] tracking-wide leading-tight uppercase">
                {t.title}
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="font-body text-sm text-[#E2E6E8]/85 leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Dual Editorial Lookbook Cards with Staggered Entrance */}
        <motion.div
          variants={cardsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Card 1: Heavyweight Hoodie Front Detail */}
          <motion.div
            variants={cardItem}
            className="relative group overflow-hidden border-2 border-[#D8A065]/40 glass-card-luxury card-hover-alive rounded-sm shadow-2xl"
          >
            <div className="aspect-4/5 overflow-hidden relative">
              <img
                src={frontCard?.image || streetwearEditorial}
                alt="LAHAB Heavyweight Hoodie Editorial Front"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-105 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-[#0D1929]/30 to-transparent" />
            </div>

            <div className="p-6 sm:p-8 space-y-3 relative z-10 -mt-16 bg-[#0D1929]/95 border-t border-[#E2E6E8]/20 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                  {frontCard?.title || (isArabic ? 'هودي الشارع المعماري // الواجهة' : 'FRONT ARCHITECTURE // HOODIE')}
                </span>
                <span className="font-mono text-xs text-[#E2E6E8] border border-[#E2E6E8]/30 px-2 py-0.5">
                  520 GSM
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 leading-relaxed">
                {frontCard?.description || (isArabic
                  ? 'قصة بأكتاف ساقطة واسعة تضمن ثبات وانسيابية القماش، وتطريز ذهبي مطفي عالي الدقة على الصدر.'
                  : 'Boxy drop-shoulder cut with dense drape, reinforced double hood collar, and high-density matte gold chest embroidery.')}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Heavyweight Hoodie Back Artwork & Silhouette */}
          <motion.div
            variants={cardItem}
            className="relative group overflow-hidden border-2 border-[#D8A065]/40 glass-card-luxury card-hover-alive rounded-sm shadow-2xl"
          >
            <div className="aspect-4/5 overflow-hidden relative bg-[#0B1524] flex items-center justify-center">
              <img
                src={backCard?.image || streetwearEditorial}
                alt="LAHAB Heavyweight Hoodie Flame Calligraphy Silhouette"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-110 brightness-95 scale-x-[-1] transition-transform duration-700 group-hover:scale-x-[-1] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-[#0D1929]/30 to-transparent" />
            </div>

            <div className="p-6 sm:p-8 space-y-3 relative z-10 -mt-16 bg-[#0D1929]/95 border-t border-[#E2E6E8]/20 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                  {backCard?.title || (isArabic ? 'طباعة حروف اللهب // الظهر' : 'FLAME CALLIGRAPHY // BACK')}
                </span>
                <span className="font-mono text-xs text-[#E2E6E8] border border-[#E2E6E8]/30 px-2 py-0.5">
                  520 GSM
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 leading-relaxed">
                {backCard?.description || (isArabic
                  ? 'طباعة أرشيفية عريضة بحروف لَهَب تعكس طاقة النار، محاطة بحواف متينة ونسيج صوف فرينش تيري فائق النعومة والمتانة.'
                  : 'Monumental arch back print honoring fire calligraphic dynamism, framed by ultra-durable French Terry ribs.')}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 p-8 border border-[#D8A065]/40 bg-[#132238]/50 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-heading text-xl text-[#D8A065] tracking-wide uppercase">
              {t.craftTitle}
            </h3>
            <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 max-w-2xl mt-1">
              {t.craftDesc}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSizingModal}
              className="btn-lahab-outline px-6 py-3.5 text-xs font-bold cursor-pointer"
            >
              {t.btnMatrix}
            </button>
            <a
              href="#products"
              className="btn-lahab-primary px-6 py-3.5 text-xs font-bold cursor-pointer"
            >
              {t.btnExplore}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default EditorialLookbook;
