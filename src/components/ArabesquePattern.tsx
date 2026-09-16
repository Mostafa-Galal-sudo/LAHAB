import React from 'react';

interface ArabesquePatternProps {
  className?: string;
  opacity?: number;
  strokeColor?: string; // Must be strictly one of the 3 hex values: #E0A96D or #E0E1DD
}

/**
 * ArabesquePattern: Faint geometric line pattern reflecting authentic
 * Islamic/Arabesque geometric star and rosette tessellations.
 * Used strictly with the 3 permitted colors and fine 1px strokes.
 */
export const ArabesquePattern: React.FC<ArabesquePatternProps> = ({
  className = '',
  opacity = 0.18,
  strokeColor = '#E0A96D',
}) => {
  return (
    <svg
      className={`select-none pointer-events-none ${className}`}
      width="100%"
      height="100%"
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="arabesque-grid"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          {/* Central 8-pointed star rosette lines */}
          <path
            d="M40 0 L50 25 L75 15 L65 40 L90 50 L65 60 L75 85 L50 75 L40 100 L30 75 L5 85 L15 60 L-10 50 L15 40 L5 15 L30 25 Z"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.75"
            strokeOpacity={opacity}
          />
          {/* Inner octagonal lattice */}
          <polygon
            points="40,15 60,35 60,65 40,85 20,65 20,35"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.5"
            strokeOpacity={opacity * 0.7}
          />
          {/* Diagonal connecting lines */}
          <line
            x1="0"
            y1="0"
            x2="80"
            y2="80"
            stroke={strokeColor}
            strokeWidth="0.5"
            strokeOpacity={opacity * 0.5}
          />
          <line
            x1="80"
            y1="0"
            x2="0"
            y2="80"
            stroke={strokeColor}
            strokeWidth="0.5"
            strokeOpacity={opacity * 0.5}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque-grid)" />
    </svg>
  );
};
export default ArabesquePattern;
