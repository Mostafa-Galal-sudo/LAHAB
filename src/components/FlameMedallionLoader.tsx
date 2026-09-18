import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Wordmark from './Wordmark';
import FlameCalligraphy from './FlameCalligraphy';
import styles from './FlameMedallionLoader.module.css';

type IntroPhase = 'playing' | 'opening' | 'skipped' | 'finished';

// Fixed trajectories keep the ignition consistent across renders and devices.
const embers = [
  { x: -122, y: -175, delay: 0.48, size: 2 },
  { x: 98, y: -202, delay: 0.54, size: 3 },
  { x: -62, y: -246, delay: 0.61, size: 2 },
  { x: 145, y: -110, delay: 0.67, size: 2 },
  { x: -158, y: -94, delay: 0.73, size: 3 },
  { x: 46, y: -272, delay: 0.79, size: 2 },
  { x: -88, y: -146, delay: 0.86, size: 2 },
  { x: 114, y: -158, delay: 0.94, size: 2 },
] as const;

export const FlameMedallionLoader: React.FC = () => {
  const [phase, setPhase] = useState<IntroPhase>('playing');
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const finished = phase === 'finished';

  useLayoutEffect(() => {
    if (finished) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;

    // The top layer keeps background controls inert and traps keyboard focus.
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    const delay = phase === 'playing'
      ? (reduceMotion ? 500 : 2900)
      : (phase === 'skipped' || reduceMotion ? 160 : 860);
    const timer = window.setTimeout(
      () => setPhase(phase === 'playing' ? 'opening' : 'finished'),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reduceMotion, finished]);

  if (finished) return null;

  const skip = () => setPhase('skipped');

  return (
    <dialog
      ref={dialogRef}
      className={styles.intro}
      data-phase={phase}
      data-reduced-motion={reduceMotion}
      aria-label="Welcome to LAHAB"
      onCancel={(event) => { event.preventDefault(); skip(); }}
    >
      <div className={styles.doorLeft} aria-hidden="true" />
      <div className={styles.doorRight} aria-hidden="true" />
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.seam} aria-hidden="true" />

      <div className={styles.chrome}>
        <span className={styles.provenance} aria-hidden="true">
          CAIRO <span className={styles.provenanceRule} /> <span lang="ar">القاهرة</span>
        </span>
        <button type="button" onClick={skip} className={styles.skip} aria-label="Skip introduction">
          <span>Skip intro</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M4 12h15m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      <div className={styles.composition} aria-hidden="true">
        <div className={styles.crest}>
          <div className={styles.heat} />
          <div className={styles.ignition} />
          <div className={styles.shockwave} />

          {/* A calligraphic seal drawn in gold, echoing the brand's arabesque. */}
          <svg className={styles.seal} viewBox="0 0 320 320" fill="none">
            <circle className={styles.outerRing} cx="160" cy="160" r="143" pathLength="1" />
            <circle className={styles.innerRing} cx="160" cy="160" r="130" pathLength="1" />
            <path className={styles.petal} pathLength="1"
              d="M160 15 C175 76 223 102 249 160 C223 218 175 244 160 305 C145 244 97 218 71 160 C97 102 145 76 160 15Z" />
            <path className={styles.petalCross} pathLength="1"
              d="M15 160 C76 145 102 97 160 71 C218 97 244 145 305 160 C244 175 218 223 160 249 C102 223 76 175 15 160Z" />
            <path className={styles.flourish} pathLength="1"
              d="M70 236 C5 168 91 58 160 45 C241 29 294 131 257 195 C224 252 140 274 98 251" />
            <path className={styles.flourishSecond} pathLength="1"
              d="M250 84 C315 152 229 262 160 275 C79 291 26 189 63 125 C96 68 180 46 222 69" />
            <g className={styles.points}>
              <path d="m160 9 3 8-3 8-3-8Zm0 286 3 8-3 8-3-8ZM9 160l8-3 8 3-8 3Zm286 0 8-3 8 3-8 3Z" />
            </g>
          </svg>

          <div className={styles.flame}>
            <FlameCalligraphy size="100%" showBackdrop={false} />
          </div>

          {!reduceMotion && (
            <div className={styles.embers}>
              {embers.map((ember, index) => (
                <span key={index} className={styles.ember} style={{
                  '--ember-x': `${ember.x}px`,
                  '--ember-y': `${ember.y}px`,
                  '--ember-delay': `${ember.delay}s`,
                  '--ember-size': `${ember.size}px`,
                } as React.CSSProperties} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.wordmarkReveal}>
          <div className={styles.wordmark}>
            <Wordmark size="hero" showMedallion={false} />
          </div>
          <span className={styles.goldSweep} />
        </div>

        <div className={styles.signature}>
          <span className={styles.signatureRule} />
          <span>Nocturnal heritage <span className={styles.slash}>/</span> Couture</span>
          <span className={styles.signatureRule} />
        </div>
      </div>

      <div className={styles.footer} aria-hidden="true">
        <span className={styles.footerLabel}>Streetwear. Forged in fire.</span>
        <div className={styles.timeline}><span /></div>
      </div>
    </dialog>
  );
};

export default FlameMedallionLoader;
