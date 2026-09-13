import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Wordmark from './Wordmark';
import FlameCalligraphy from './FlameCalligraphy';
import { TranslationSchema } from '../translations';
import watercolorHeroArt from '../assets/images/watercolor_hero_art_1788904793593.jpg';

interface HeroSectionProps {
  onExploreClick: () => void;
  t: TranslationSchema['hero'];
  isArabic: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  t,
  isArabic,
}) => {
  return (
    <header
      id="hero"
      className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden px-6 sm:px-10 lg:px-16 pt-28 pb-16 bg-[#0D1929]"
    >
      {/* 
        Hero Background:
        Watercolor artwork from image.png with deep nocturnal contrast
      */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <img
          src={watercolorHeroArt}
          alt="LAHAB Watercolor Artwork"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 filter contrast-110"
        />
        {/* Navy gradient overlays ensuring sharp contrast and deep nocturnal atmosphere */}
        <div
          className={`absolute inset-0 ${
            isArabic
              ? 'bg-linear-to-l from-[#0D1929] via-[#0D1929]/85 to-transparent'
              : 'bg-linear-to-r from-[#0D1929] via-[#0D1929]/85 to-transparent'
          }`}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0D1929] via-transparent to-[#0D1929]/70" />

        {/* Luminous dynamic ember light bloom */}
        <div
          className={`absolute top-1/4 ${
            isArabic ? 'right-1/3' : 'left-1/3'
          } w-96 h-96 bg-[#D8A065]/12 rounded-full blur-3xl pointer-events-none transition-all duration-700`}
        />
      </div>

      {/* Floating Calligraphic Flame Symbol (Repositions smoothly to the left in Arabic) */}
      <motion.div
        layout
        layoutId="hero-flame-symbol"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute top-1/3 -translate-y-1/2 z-10 pointer-events-none select-none hidden md:flex flex-col items-center justify-center transition-all duration-700 ${
          isArabic
            ? 'left-8 sm:left-16 lg:left-24 right-auto'
            : 'right-8 sm:right-16 lg:right-24 left-auto'
        }`}
      >
        {/* Soft glowing concentric aura */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-[#D8A065]/20 animate-pulse" />
          <div className="absolute w-48 h-48 lg:w-60 lg:h-60 rounded-full border border-[#D8A065]/15" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(216,160,101,0.2),transparent_70%)] blur-2xl pointer-events-none" />

          {/* Master Calligraphic Flame Silhouette */}
          <div className="relative z-10 p-6 filter drop-shadow-[0_0_35px_rgba(216,160,101,0.4)]">
            <FlameCalligraphy
              size={195}
              color="#D8A065"
              showBackdrop={false}
              ariaLabel="LAHAB Flame Calligraphy Symbol"
            />
          </div>
        </div>

        {/* Subtle architectural coordinates marker */}
        <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-[#D8A065]/60 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-[#D8A065]/70 rotate-45" />
          <span>FLAME SYMBOL // ARTIFACT</span>
        </div>
      </motion.div>

      {/* Hero Content: strictly anchored in the dark quadrant */}
      <div className="relative z-10 max-w-4xl pt-6 sm:pt-10">
        {/* Drop Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-3 border border-[#D8A065]/60 px-4 py-1.5 mb-8 bg-[#0D1929]/80 backdrop-blur-md"
        >
          <span className="w-2 h-2 bg-[#D8A065] animate-pulse" />
          <span className="font-heading text-xs tracking-widest text-[#D8A065]">
            {t.dropBadge}
          </span>
        </motion.div>

        {/* Master Brand Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 -ml-2 max-w-xl"
        >
          <Wordmark size="hero" showMedallion={true} />
        </motion.div>

        {/* Tagline & Subcopy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-2xl mb-10"
        >
          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl text-[#D8A065] tracking-wide leading-tight">
            {t.tagline}
          </h1>

          <p className="font-body text-base sm:text-lg text-[#E2E6E8] leading-relaxed max-w-xl font-normal opacity-90">
            {t.subTagline}
          </p>
        </motion.div>

        {/* Styled Buttons with Rich Tactile Identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-5 pt-2"
        >
          <button
            id="hero-cta-button"
            onClick={onExploreClick}
            className="btn-lahab-primary px-8 py-4 text-sm flex items-center gap-3 group cursor-pointer"
          >
            <span>{t.ctaShop}</span>
            <span className="font-mono font-bold text-base transition-transform group-hover:translate-x-1">
              {isArabic ? '←' : '→'}
            </span>
          </button>

          <a
            href="#story"
            className="btn-lahab-outline px-7 py-4 text-xs font-bold"
          >
            {t.ctaStory}
          </a>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator guiding users to product collection with smooth pulsing animation */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45 }}
        className="relative z-10 pt-10 pb-4 flex flex-col items-center justify-center"
      >
        <a
          href="#products"
          id="hero-scroll-indicator"
          className="flex flex-col items-center gap-2 text-[#D8A065]/75 hover:text-[#D8A065] transition-colors group cursor-pointer"
        >
          <span className="font-heading text-[10px] tracking-[0.28em] uppercase text-[#D8A065] group-hover:tracking-[0.35em] transition-all">
            {t.scrollPrompt}
          </span>

          {/* Architectural Pill with pulsing gliding dot */}
          <div className="relative w-5 h-9 rounded-full border border-[#D8A065]/50 flex items-start justify-center p-1 bg-[#0D1929]/80 backdrop-blur-sm group-hover:border-[#D8A065] transition-colors shadow-[0_0_15px_rgba(216,160,101,0.15)]">
            <motion.div
              animate={{
                y: [0, 14, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-1.5 h-2 rounded-full bg-[#D8A065]"
            />
          </div>

          <motion.div
            animate={{
              y: [0, 4, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#D8A065]" />
          </motion.div>
        </a>
      </motion.div>

      {/* Hero Bottom Bar Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative z-10 pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-t border-[#E2E6E8]/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#D8A065]/50 flex items-center justify-center bg-[#0D1929]/60">
            <span className="w-3 h-3 bg-[#D8A065] rotate-45" />
          </div>
          <div>
            <span className="block font-heading text-xs sm:text-sm text-[#D8A065] tracking-wider">
              {t.aestheticTag}
            </span>
            <span className="block font-body text-xs text-[#E2E6E8]/80">
              {t.fabricTag}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 text-xs font-body tracking-wider text-[#E2E6E8]">
          <div>
            <span className="block text-[#D8A065] font-bold">{t.editionLabel}</span>
            <span className="text-[#E2E6E8]/80">{t.editionValue}</span>
          </div>
          <div>
            <span className="block text-[#D8A065] font-bold">{t.shippingLabel}</span>
            <span className="text-[#E2E6E8]/80">{t.shippingValue}</span>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
export default HeroSection;
