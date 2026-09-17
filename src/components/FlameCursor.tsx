import React, { useEffect, useState, useRef } from 'react';

interface FlameCursorProps {
  theme?: 'navy' | 'desert';
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const FlameCursor: React.FC<FlameCursorProps> = ({ theme = 'navy' }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const embersRef = useRef<Ember[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastPos = useRef({ x: -100, y: -100 });

  // Palette of flame colors depending on theme
  const getFlameColors = () => {
    if (theme === 'desert') {
      return ['#D97706', '#F59E0B', '#B07436', '#EF4444', '#FCD34D'];
    }
    return ['#FF4500', '#FF8C00', '#D8A065', '#E5AC72', '#FFE4B5'];
  };

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.documentElement.classList.add('flame-cursor-active');
    return () => document.documentElement.classList.remove('flame-cursor-active');
  }, []);

  useEffect(() => {
    // Check if pointer is coarse (touchscreen)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      // Spawn flame embers on move
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      const count = isHovered ? 4 : speed > 5 ? 3 : 1;
      const colors = getFlameColors();

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 1.5 + 0.5;
        embersRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6 + 14, // position at base of flame icon below cursor tip
          vx: Math.cos(angle) * velocity * 0.5 + (Math.random() - 0.5) * 0.8,
          vy: -Math.abs(Math.sin(angle) * velocity) - Math.random() * 1.5 - 0.5, // float upwards like fire
          size: Math.random() * (isHovered ? 4.5 : 3.5) + 1.5,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      lastPos.current = { x, y };
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detect clickable element hovering
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer');
      
      setIsHovered(isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [isHovered, theme]);

  // Render loop for particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw embers
      for (let i = embersRef.current.length - 1; i >= 0; i--) {
        const ember = embersRef.current[i];
        ember.x += ember.vx;
        ember.y += ember.vy; // move up
        ember.alpha -= ember.decay;
        ember.size *= 0.96; // shrink as it burns out

        if (ember.alpha <= 0 || ember.size <= 0.3) {
          embersRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ember.alpha;
        ctx.fillStyle = ember.color;
        ctx.shadowColor = ember.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ opacity: isVisible ? 1 : 0 }} className="transition-opacity duration-200">
      {/* Main Flame Icon Cursor */}
      <div
        className="fixed pointer-events-none z-9999 will-change-transform"
        style={{
          left: `${pos.x - 2}px`,
          top: `${pos.y - 14}px`,
          transform: `translate(-35%, 0px) scale(${
            isMouseDown ? 0.8 : isHovered ? 1.35 : 1
          })`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="relative flex flex-col items-center justify-start">
          {/* Flame Ambient Glow centered at top tip */}
          <div
            className={`absolute top-2 rounded-full filter blur-md animate-pulse transition-all ${
              isHovered
                ? 'w-10 h-10 bg-amber-500/70 shadow-[0_0_20px_#FF4500]'
                : 'w-7 h-7 bg-amber-500/40 shadow-[0_0_12px_#D8A065]'
            }`}
          />

          {/* SVG Flame Icon (Fire shape) */}
          <svg
            width="28"
            height="34"
            viewBox="0 0 24 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 filter drop-shadow-[0_2px_8px_rgba(255,69,0,0.8)]"
          >
            <defs>
              <linearGradient id="flameGradOuter" x1="12" y1="28" x2="12" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CC2200" />
                <stop offset="40%" stopColor="#FF4500" />
                <stop offset="75%" stopColor="#FF9900" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
              <linearGradient id="flameGradInner" x1="12" y1="24" x2="12" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4500" />
                <stop offset="60%" stopColor="#FFCC00" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>

            {/* Outer Flame shape */}
            <path
              d="M12 0C12 0 13.8 4.2 11.4 7.8C9.5 10.7 6 12 6 16.5C6 20.6 8.7 24 13.5 24C18.3 24 20.5 20.3 20.5 16.5C20.5 10.5 15.5 8 15.5 8C15.5 8 16.8 11 14.8 12.8C12.8 14.6 11.5 13 11.5 11C11.5 8.5 14 5 12 0Z"
              fill="url(#flameGradOuter)"
            />

            {/* Inner intense flame core */}
            <path
              d="M12.5 8C12.5 8 13.5 10.5 12.2 12.5C11.2 14.1 9.5 14.8 9.5 17.5C9.5 20 11.2 22 14 22C16.8 22 18 19.5 18 17.5C18 14 15 12.5 15 12.5C15 12.5 15.8 14 14.8 15C13.8 16 13 15 13 13.8C13 12.2 14.2 10.5 12.5 8Z"
              fill="url(#flameGradInner)"
              opacity="0.95"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FlameCursor;
