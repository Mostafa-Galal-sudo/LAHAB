import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Wordmark from './Wordmark';
import FlameCalligraphy from './FlameCalligraphy';

export const FlameMedallionLoader: React.FC = () => {
  const [stage, setStage] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Stage 0: Initial ambient glow & flame symbol emergence
    const timer1 = setTimeout(() => setStage(1), 600);
    // Stage 1: Full wordmark reveal & gold line draw
    const timer2 = setTimeout(() => setStage(2), 1600);
    // Stage 2: Luxury subtitle fade in
    const timer3 = setTimeout(() => setStage(3), 2600);
    // Exit stage
    const timer4 = setTimeout(() => setIsVisible(false), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-99999 bg-[#070D14] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Background Luxury Ambient Glows */}
          <div className="absolute w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(216,160,101,0.22)_0%,rgba(216,160,101,0.05)_40%,transparent_70%)] blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(255,100,50,0.12)_0%,transparent_60%)] blur-2xl pointer-events-none" />

          {/* Floating Gold Dust Particles */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50 + '%', 
                  y: '110%', 
                  opacity: 0, 
                  scale: Math.random() * 0.8 + 0.4 
                }}
                animate={{ 
                  y: '-10%', 
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{ 
                  duration: 2.5 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 1.5,
                  ease: 'easeOut'
                }}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#D8A065] shadow-[0_0_8px_#D8A065]"
                style={{ left: `${(i * 8) + 2}%` }}
              />
            ))}
          </div>

          {/* Stage 0 & 1: Master Calligraphic Flame Crest & Wordmark */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4">
            
            {/* Calligraphy Emblem with Pulsing Golden Ring */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-2"
            >
              {/* Concentric Architectural Gold Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute w-40 h-40 rounded-full border border-dashed border-[#D8A065]/30 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                className="absolute w-48 h-48 rounded-full border border-[#D8A065]/15 pointer-events-none"
              />
              
              {/* Flame Calligraphy Icon */}
              <div className="p-4 filter drop-shadow-[0_0_25px_rgba(216,160,101,0.5)]">
                <FlameCalligraphy size={90} color="#D8A065" showBackdrop={false} />
              </div>
            </motion.div>

            {/* Wordmark Reveal */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: stage >= 1 ? 0 : 20, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <Wordmark size="lg" showMedallion={false} />
            </motion.div>

            {/* Luxury Architectural Separator & Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 pt-2"
            >
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: stage >= 2 ? 48 : 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-px bg-linear-to-r from-transparent to-[#D8A065]" 
              />
              <span className="font-heading text-xs text-[#D8A065] tracking-[0.4em] uppercase shadow-sm">
                NOCTURNAL HERITAGE // COUTURE
              </span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: stage >= 2 ? 48 : 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-px bg-linear-to-l from-transparent to-[#D8A065]" 
              />
            </motion.div>

            {/* Loading Status Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="pt-6 flex items-center gap-2 font-mono text-[10px] text-[#D8A065]/70 tracking-widest uppercase"
            >
              <span className="w-1.5 h-1.5 bg-[#D8A065] rotate-45 animate-ping" />
              <span>ENTER VAULT</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlameMedallionLoader;

