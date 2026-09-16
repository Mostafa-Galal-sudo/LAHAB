import React from 'react';

interface WordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showMedallion?: boolean;
}

/**
 * Wordmark: LΛHΛB
 * Faithfully matches the exact brand wordmark provided in image.png:
 * - "L": Angular condensed stem with 45-degree interior chamfer bevel.
 * - "Λ": Clean geometric inverted chevron / lambda.
 * - "H": Central calligraphic masterpiece with sweeping flourish tail on the left,
 *        graceful looping crossbar, right upright with teardrop loop & Arabic diacritics,
 *        backed by a fine-line symmetrical Arabesque floral/star medallion.
 * - "Λ": Matching sharp geometric lambda.
 * - "B": Heavy geometric sans with 45-degree chamfered top-left shoulder.
 * - Color: Warm soft matte gold (#D8A065) matching the provided image.
 */
export const Wordmark: React.FC<WordmarkProps> = ({
  className = '',
  size = 'hero',
  showMedallion = true,
}) => {
  const sizeStyles = {
    sm: 'h-8 sm:h-9',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
    hero: 'h-24 sm:h-32 md:h-40 lg:h-48 w-auto max-w-full',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      id="lahab-master-wordmark"
    >
      <svg
        viewBox="0 0 1000 480"
        className={`${sizeStyles[size]} object-contain drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gold metallic shimmer gradient matching image.png */}
          <linearGradient id="lahab-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DEAA70" />
            <stop offset="50%" stopColor="#D8A065" />
            <stop offset="100%" stopColor="#C89355" />
          </linearGradient>

          {/* Chamfer shadow tone for the beveled cuts */}
          <linearGradient id="lahab-bevel-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C48E50" />
            <stop offset="100%" stopColor="#A8753B" />
          </linearGradient>
        </defs>

        {/* 
          1. Symmetrical Arabesque Medallion Backdrop behind the central H
          Matches the fine thin gold filigree rosette from image.png
        */}
        {showMedallion && (
          <g id="arabesque-medallion" opacity="0.65" stroke="#D8A065" strokeWidth="1.75">
            {/* Center coordinates: (500, 240) */}
            {/* Outer pointed lotus/star petals */}
            <path
              d="M500 90 
                 C515 140, 560 170, 580 200 
                 C615 220, 640 240, 615 260 
                 C590 280, 565 310, 550 340 
                 C530 380, 515 410, 500 415 
                 C485 410, 470 380, 450 340 
                 C435 310, 410 280, 385 260 
                 C360 240, 385 220, 420 200 
                 C440 170, 485 140, 500 90 Z"
              fill="none"
            />
            {/* Secondary pointed top/bottom arches */}
            <path
              d="M500 115 
                 C525 155, 555 190, 595 240 
                 C555 290, 525 325, 500 365 
                 C475 325, 445 290, 405 240 
                 C445 190, 475 155, 500 115 Z"
              fill="none"
            />
            {/* Fine decorative radiating radial lines */}
            <line x1="500" y1="90" x2="500" y2="415" strokeWidth="1.2" strokeDasharray="6 4" />
            <line x1="380" y1="240" x2="620" y2="240" strokeWidth="1.2" strokeDasharray="6 4" />
            <circle cx="500" cy="240" r="115" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="500" cy="240" r="60" strokeWidth="1" opacity="0.5" />
            {/* Curved side flourishes */}
            <path d="M430 190 Q460 240 430 290" fill="none" strokeWidth="1.2" />
            <path d="M570 190 Q540 240 570 290" fill="none" strokeWidth="1.2" />
          </g>
        )}

        {/* 
          2. LETTER "L"
          From image.png:
          - Heavy vertical stem
          - Horizontal base
          - 45-degree beveled cut on the interior inside corner
        */}
        <g id="letter-L">
          {/* Main L body */}
          <path
            d="M140 130 
               H182 
               V285 
               L222 325 
               H265 
               V365 
               H140 
               Z"
            fill="url(#lahab-gold)"
          />
          {/* Interior 45-degree chamfer / bevel facet */}
          <polygon
            points="182,285 222,325 182,325"
            fill="url(#lahab-bevel-shadow)"
          />
          <line
            x1="182"
            y1="285"
            x2="222"
            y2="325"
            stroke="#CCA06A"
            strokeWidth="1.5"
          />
        </g>

        {/* 
          3. LETTER "Λ" (First Lambda)
          From image.png:
          - Pure geometric chevron
          - Clipped flat apex
          - Open bottom cutout
        */}
        <g id="letter-Lambda-1">
          <path
            d="M325 130 
               H350 
               L405 365 
               H368 
               L337 220 
               L307 365 
               H270 
               Z"
            fill="url(#lahab-gold)"
          />
        </g>

        {/* 
          4. LETTER "H" (Calligraphic Centrepiece with Islamic script flourishes)
          From image.png:
          - Left leg: sweeping calligraphic curve with a swooping swan-tail curling outward
          - Central loop crossbar
          - Right leg: tall graceful upright with teardrop loop & Arabic diacritics
        */}
        <g id="letter-H-calligraphy">
          {/* Left sweeping curved stem and swan-tail flourish */}
          <path
            d="M450 135 
               C465 175, 465 220, 458 265 
               C452 295, 436 325, 412 355 
               C395 375, 380 388, 375 375 
               C372 365, 378 350, 395 330 
               C410 312, 420 288, 426 250 
               C428 220, 430 180, 435 140 
               C436 130, 442 125, 450 135 Z"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />

          {/* Elegant curl and feather on the lower left tail */}
          <path
            d="M395 330 
               C380 345, 372 360, 375 375 
               C378 388, 395 375, 412 355 
               C402 360, 390 355, 395 330 Z"
            fill="#DEAA70"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />
          {/* Small leaf/feather flick on the outer tail */}
          <path
            d="M418 220 
               C405 230, 400 245, 405 255 
               C410 248, 415 240, 425 235 Z"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />

          {/* Central looping crossbar connecting the two stems */}
          <path
            d="M440 250 
               C460 235, 490 230, 525 245 
               C540 252, 550 262, 545 272 
               C540 280, 525 282, 500 270 
               C470 256, 450 260, 440 250 Z"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />

          {/* Right upright stem with top rounded teardrop loop */}
          <path
            d="M585 125 
               C595 130, 595 145, 590 170 
               C582 210, 580 260, 582 310 
               C583 335, 582 355, 575 365 
               C568 375, 555 370, 550 355 
               C545 338, 548 310, 550 270 
               C552 230, 555 185, 560 150 
               C563 130, 572 120, 585 125 Z"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />

          {/* Arabic diacritics nestled inside the H from image.png */}
          {/* Small teardrop / dammah curl */}
          <path
            d="M565 175 
               C575 165, 585 170, 585 182 
               C585 195, 572 205, 565 195 
               C560 188, 558 180, 565 175 Z"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />
          {/* Diacritic diamond nuqta dot */}
          <polygon
            points="568,225 574,231 568,237 562,231"
            fill="url(#lahab-gold)"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />
          {/* Elegant harakah accent line */}
          <path
            d="M562 250 L576 265"
            stroke="#D8A065"
            strokeWidth="3.5"
            strokeLinecap="round"
            transform="translate(20, 0)"
            style={{ transform: 'translate(20px, 0px)' }}
          />
        </g>

        {/* 
          5. LETTER "Λ" (Second Lambda)
          Matches the first lambda
        */}
        <g id="letter-Lambda-2">
          <path
            d="M665 130 
               H690 
               L745 365 
               H708 
               L677 220 
               L647 365 
               H610 
               Z"
            fill="url(#lahab-gold)"
          />
        </g>

        {/* 
          6. LETTER "B"
          From image.png:
          - 45-degree chamfer / beveled cut on the top-left outer shoulder!
          - Straight vertical back
          - Two bold loops with angular geometric interior counters
        */}
        <g id="letter-B">
          {/* Main B body with top-left chamfer bevel */}
          <path
            d="M780 130 
               L745 165 
               V365 
               H830 
               C865 365, 890 345, 890 305 
               C890 275, 875 255, 850 248 
               C870 240, 885 220, 885 190 
               C885 150, 858 130, 820 130 
               H780 Z
               M782 170 
               H815 
               C835 170, 848 180, 848 200 
               C848 220, 835 230, 815 230 
               H782 
               V170 Z
               M782 265 
               H822 
               C845 265, 855 278, 855 302 
               C855 325, 845 335, 822 335 
               H782 
               V265 Z"
            fill="url(#lahab-gold)"
            fillRule="evenodd"
          />
          {/* Chamfer highlight on the top-left shoulder */}
          <line
            x1="780"
            y1="130"
            x2="745"
            y2="165"
            stroke="#CCA06A"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
};
export default Wordmark;
