import React from 'react';
import lahabLogoPng from '../assets/lahab_flame_calligraphy_logo.png';

interface FlameCalligraphyProps {
  className?: string;
  size?: number | string;
  color?: string; // Kept for interface compatibility
  ariaLabel?: string;
  showBackdrop?: boolean;
}

/**
 * FlameCalligraphy: Renders the exact user-provided LAHAB Calligraphy Flame logo PNG image.
 */
export const FlameCalligraphy: React.FC<FlameCalligraphyProps> = ({
  className = '',
  size = 64,
  ariaLabel = 'لهب - Lahab Flame Calligraphy Logo',
  showBackdrop = false,
}) => {
  const widthStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: widthStyle }}
      role="img"
      aria-label={ariaLabel}
    >
      {showBackdrop && (
        <div className="absolute inset-0 rounded-full bg-[#1B263B]/60 border border-[#D8A065]/20 blur-sm pointer-events-none" />
      )}
      <img
        src={lahabLogoPng}
        alt={ariaLabel}
        className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(216,160,101,0.4)]"
      />
    </div>
  );
};

export default FlameCalligraphy;
