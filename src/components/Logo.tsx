import React from 'react';

interface LogoProps {
  variant?: 'header' | 'hero' | 'footer' | 'icon-only';
  className?: string;
  showTagline?: boolean;
}

export const SpaLotusHandIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-9 h-9',
  size,
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    {/* Soft Halo */}
    <circle cx="50" cy="50" r="46" fill="currentColor" fillOpacity="0.08" />
    
    {/* Blooming Lotus Center Petals in Gold */}
    <path
      d="M50 16 C53 28, 62 42, 50 66 C38 42, 47 28, 50 16 Z"
      fill="#D4AF37"
    />
    <path
      d="M50 26 C62 38, 76 48, 64 68 C53 58, 48 48, 50 26 Z"
      fill="#E5C76B"
      opacity="0.9"
    />
    <path
      d="M50 26 C38 38, 24 48, 36 68 C47 58, 52 48, 50 26 Z"
      fill="#E5C76B"
      opacity="0.9"
    />
    {/* Outer Petals */}
    <path
      d="M50 38 C70 46, 84 56, 73 73 C58 71, 52 62, 50 38 Z"
      fill="#DFBA73"
      opacity="0.75"
    />
    <path
      d="M50 38 C30 46, 16 56, 27 73 C42 71, 48 62, 50 38 Z"
      fill="#DFBA73"
      opacity="0.75"
    />
    {/* Flowing Caring Hands Arch (Cupping the lotus base) */}
    <path
      d="M18 73 C30 84, 70 84, 82 73 C75 87, 25 87, 18 73 Z"
      fill="#C5A880"
    />
    <path
      d="M32 78 C42 83, 58 83, 68 78 C62 85, 38 85, 32 78 Z"
      fill="#D4AF37"
    />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  variant = 'header',
  className = '',
  showTagline = true,
}) => {
  const isFooter = variant === 'footer';
  const isHero = variant === 'hero';

  if (variant === 'icon-only') {
    return <SpaLotusHandIcon className="w-10 h-10 text-[#1C2E24]" />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`shrink-0 flex items-center justify-center rounded-full transition-transform hover:scale-105 ${
          isFooter
            ? 'bg-[#284133] text-[#FAF7F2] p-1.5'
            : 'bg-[#1C2E24]/5 text-[#1C2E24] p-1.5'
        }`}
      >
        <SpaLotusHandIcon
          className={isHero ? 'w-12 h-12' : isFooter ? 'w-10 h-10' : 'w-9 h-9'}
        />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-serif tracking-tight font-medium ${
            isHero
              ? 'text-3xl sm:text-4xl text-[#1C2E24]'
              : isFooter
              ? 'text-2xl text-[#FAF7F2]'
              : 'text-xl sm:text-2xl text-[#1C2E24]'
          }`}
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          Nthabi's Touch
        </span>
        {showTagline && (
          <span
            className={`text-[10px] sm:text-xs tracking-widest uppercase mt-1 font-medium ${
              isFooter ? 'text-[#D4AF37]' : 'text-[#8C6D46]'
            }`}
            style={{ letterSpacing: '0.18em' }}
          >
            Relax · Restore · Renew
          </span>
        )}
      </div>
    </div>
  );
};
