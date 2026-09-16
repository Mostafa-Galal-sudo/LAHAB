import React from 'react';
import { motion } from 'motion/react';
import Wordmark from './Wordmark';
import { TranslationSchema } from '../translations';

interface BrandStoryProps {
  t: TranslationSchema['story'];
  isArabic: boolean;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ t }) => {
  return (
    <section
      id="story"
      className="bg-[#0D1929] text-[#E2E6E8] px-6 sm:px-10 lg:px-16 py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      {/* Subtle organic light bloom in the background for depth */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#D8A065]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header with scroll entrance */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between pb-8 mb-16 border-b border-[#E2E6E8]/20"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#D8A065]" />
            <h2 className="font-heading text-lg sm:text-xl text-[#D8A065] tracking-widest uppercase">
              {t.badge}
            </h2>
          </div>
        </motion.div>

        {/* Visual Accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mx-auto flex flex-col items-center justify-center p-8 sm:p-12 border border-[#D8A065]/50 glass-card-luxury card-hover-alive relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(216,160,101,0.15),transparent_70%)] pointer-events-none" />

          <Wordmark size="lg" showMedallion={true} />

          <div className="mt-8 text-center border-t border-[#E2E6E8]/15 pt-4 w-full relative z-10 space-y-2">
            <span className="font-heading text-xs tracking-widest text-[#D8A065] block uppercase font-bold">
              HERITAGE ARCHITECTURAL CUTS
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-[10px] text-[#E2E6E8]/80">
              <span className="border border-[#D8A065]/40 px-2 py-0.5 bg-[#0D1929]/80">
                520 GSM FLEECE
              </span>

              <span className="border border-[#D8A065]/40 px-2 py-0.5 bg-[#0D1929]/80">
                GIZA 86 COTTON
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
