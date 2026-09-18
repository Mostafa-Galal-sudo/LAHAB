import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Wordmark from './Wordmark';
import FlameCalligraphy from './FlameCalligraphy';

const emberParticles = [
  { left: 8, delay: 0.08, duration: 2.8, size: 3 },
  { left: 16, delay: 0.62, duration: 3.4, size: 2 },
  { left: 25, delay: 0.28, duration: 3.1, size: 4 },
  { left: 34, delay: 1.05, duration: 3.7, size: 2 },
  { left: 43, delay: 0.44, duration: 2.9, size: 3 },
  { left: 51, delay: 1.3, duration: 3.5, size: 2 },
  { left: 59, delay: 0.18, duration: 3.2, size: 4 },
  { left: 68, delay: 0.84, duration: 3.8, size: 2 },
  { left: 77, delay: 0.36, duration: 3, size: 3 },
  { left: 85, delay: 1.14, duration: 3.6, size: 2 },
  { left: 92, delay: 0.52, duration: 3.3, size: 3 },
] as const;

export const FlameMedallionLoader: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timings = reduceMotion ? [80, 160, 240, 900] : [320, 1050, 1850, 3200];
    const timers = [
      setTimeout(() => setStage(1), timings[0]),
      setTimeout(() => setStage(2), timings[1]),
      setTimeout(() => setStage(3), timings[2]),
      setTimeout(() => setIsVisible(false), timings[3]),
    ];

    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const cinematicTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: reduceMotion ? 1 : 1.035,
            filter: reduceMotion ? 'blur(0px)' : 'blur(8px)',
            transition: { duration: reduceMotion ? 0.2 : 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-99999 flex select-none flex-col items-center justify-center overflow-hidden bg-[#050B12]"
          role="status"
          aria-label="Entering LAHAB"
        >
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 1 : 0 }}
            transition={cinematicTransition}
            className="absolute inset-x-5 top-5 h-px origin-center bg-linear-to-r from-transparent via-[#D8A065]/55 to-transparent sm:inset-x-10 sm:top-8"
          />
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 0.6 : 0 }}
            transition={{ ...cinematicTransition, delay: reduceMotion ? 0 : 0.12 }}
            className="absolute inset-x-5 bottom-5 h-px origin-center bg-linear-to-r from-transparent via-[#D8A065]/45 to-transparent sm:inset-x-10 sm:bottom-8"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,160,101,0.15)_0%,rgba(111,61,30,0.08)_24%,transparent_62%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49.9%,rgba(216,160,101,0.055)_50%,transparent_50.1%)]" />

          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: stage >= 1 ? [0, 1, 0.08] : 0,
              opacity: stage >= 1 ? [0, 1, 0.2] : 0,
            }}
            transition={{ duration: reduceMotion ? 0.1 : 1.05, times: [0, 0.42, 1], ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-[64vh] w-px -translate-x-1/2 -translate-y-1/2 origin-center bg-linear-to-b from-transparent via-[#FFD29A] to-transparent shadow-[0_0_28px_rgba(216,160,101,0.85)]"
          />

          {!reduceMotion && (
            <div className="pointer-events-none absolute inset-0 opacity-55" aria-hidden="true">
              {emberParticles.map((particle) => (
                <motion.span
                  key={particle.left}
                  initial={{ y: '108vh', opacity: 0 }}
                  animate={{ y: '-8vh', opacity: [0, 0.75, 0] }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                  className="absolute rounded-full bg-[#D8A065] shadow-[0_0_10px_rgba(216,160,101,0.9)]"
                  style={{ left: `${particle.left}%`, width: particle.size, height: particle.size }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-5 text-center">
            <motion.div
              initial={{ scale: 0.72, opacity: 0, filter: 'blur(12px)' }}
              animate={{
                scale: stage >= 1 ? 1 : 0.72,
                opacity: stage >= 1 ? 1 : 0,
                filter: stage >= 1 ? 'blur(0px)' : 'blur(12px)',
              }}
              transition={cinematicTransition}
              className="relative mb-7 flex h-52 w-52 items-center justify-center sm:mb-9 sm:h-64 sm:w-64"
            >
              <motion.div
                initial={{ scale: 0.45, opacity: 0.85 }}
                animate={{ scale: stage >= 1 ? 1.55 : 0.45, opacity: stage >= 1 ? 0 : 0.85 }}
                transition={{ duration: reduceMotion ? 0.1 : 1.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-5 rounded-full border border-[#F2B774]/70 shadow-[0_0_35px_rgba(216,160,101,0.35)]"
              />

              <motion.div
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-5 rounded-full border border-dashed border-[#D8A065]/45"
              />
              <motion.div
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-[#D8A065]/20"
              />
              <div className="absolute inset-9 rounded-full border border-[#D8A065]/15 bg-[#D8A065]/3 shadow-[inset_0_0_45px_rgba(216,160,101,0.08)]" />

              {[0, 90, 180, 270].map((rotation) => (
                <span
                  key={rotation}
                  className="absolute inset-2"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  aria-hidden="true"
                >
                  <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#D8A065]/65" />
                </span>
              ))}

              <motion.div
                initial={{ scale: 0.76, opacity: 0 }}
                animate={{ scale: stage >= 1 ? 1 : 0.76, opacity: stage >= 1 ? 1 : 0 }}
                transition={{ ...cinematicTransition, delay: reduceMotion ? 0 : 0.12 }}
                className="relative z-10 rounded-full p-5 drop-shadow-[0_0_34px_rgba(216,160,101,0.7)]"
              >
                <FlameCalligraphy size="clamp(7rem,28vw,9rem)" color="#D8A065" showBackdrop={false} />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 26, opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
              animate={{
                y: stage >= 2 ? 0 : 26,
                opacity: stage >= 2 ? 1 : 0,
                clipPath: stage >= 2 ? 'inset(0 0% 0 0%)' : 'inset(0 50% 0 50%)',
              }}
              transition={cinematicTransition}
              className="drop-shadow-[0_0_24px_rgba(216,160,101,0.28)]"
            >
              <Wordmark size="xl" showMedallion={false} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : 12 }}
              transition={{ ...cinematicTransition, duration: reduceMotion ? 0.12 : 0.65 }}
              className="mt-7 flex w-full max-w-sm items-center justify-center gap-3 sm:mt-9 sm:gap-5"
            >
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: stage >= 3 ? 1 : 0 }}
                transition={cinematicTransition}
                className="h-px flex-1 origin-right bg-linear-to-r from-transparent to-[#D8A065]"
              />
              <span className="font-heading text-[10px] uppercase tracking-[0.28em] text-[#E1AB70] sm:text-xs sm:tracking-[0.4em]">
                Nocturnal heritage // Couture
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: stage >= 3 ? 1 : 0 }}
                transition={cinematicTransition}
                className="h-px flex-1 origin-left bg-linear-to-l from-transparent to-[#D8A065]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.45, delay: reduceMotion ? 0 : 0.22 }}
              className="mt-8 flex flex-col items-center gap-3 font-mono text-[9px] uppercase tracking-[0.34em] text-[#D8A065]/70"
            >
              <span>Entering the archive</span>
              <span className="relative h-px w-24 overflow-hidden bg-[#D8A065]/20">
                <motion.span
                  initial={{ x: '-100%' }}
                  animate={{ x: stage >= 3 ? '100%' : '-100%' }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.8, ease: 'easeInOut' }}
                  className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-transparent via-[#F4C58E] to-transparent"
                />
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlameMedallionLoader;
