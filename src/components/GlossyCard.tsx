import React, { useState, useRef } from 'react';

interface GlossyCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
  onClick?: () => void;
  id?: string;
}

export const GlossyCard: React.FC<GlossyCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(216, 160, 101, 0.18)',
  borderColor = 'rgba(216, 160, 101, 0.4)',
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        borderColor: isHovered ? '#D8A065' : borderColor,
      }}
    >
      {/* Dynamic Cursor Spotlight Radial Glow Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Subtle Specular Top Gloss Highlight */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D8A065]/40 to-transparent opacity-75 z-10" />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlossyCard;
