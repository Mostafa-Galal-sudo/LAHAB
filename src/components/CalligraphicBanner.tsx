import React from 'react';
import { motion } from 'motion/react';
import Wordmark from './Wordmark';

export interface CalligraphicBannerContent {
  streetwear: string;
  tagline: string;
  origin: string;
  showWordmark?: boolean;
}

interface CalligraphicBannerProps {
  content: CalligraphicBannerContent;
}

const CalligraphicBanner: React.FC<CalligraphicBannerProps> = ({ content }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    className="bg-[#132238] py-8 border-y border-[#E2E6E8]/20 flex items-center justify-center gap-6 sm:gap-10 select-none overflow-hidden px-4"
  >
    <span className="hidden sm:inline-block font-heading text-xs text-[#D8A065] tracking-widest uppercase">
      {content.streetwear}
    </span>
    <span className="w-1.5 h-1.5 bg-[#D8A065] rotate-45" />
    {content.showWordmark !== false && <Wordmark size="sm" showMedallion={false} />}
    <span className="w-1.5 h-1.5 bg-[#D8A065] rotate-45" />
    <span className="font-heading text-xs sm:text-sm text-[#D8A065] tracking-widest uppercase">
      {content.tagline}
    </span>
    <span className="hidden md:inline-block w-1.5 h-1.5 bg-[#D8A065] rotate-45" />
    <span className="hidden md:inline-block font-heading text-xs text-[#E2E6E8]/70 tracking-widest uppercase">
      {content.origin}
    </span>
  </motion.div>
);

export default CalligraphicBanner;

