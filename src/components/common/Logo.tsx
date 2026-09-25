import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'stacked' | 'icon-only' | 'monochrome';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'primary',
  showTagline = false,
  className = '',
}) => {
  // Brand color tokens
  const RED_COLOR = '#E52D27';
  const iconFill = variant === 'monochrome' ? '#FFFFFF' : RED_COLOR;

  // Icon sizing
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Typography sizing
  const finexTextSizes = {
    sm: 'text-sm font-extrabold tracking-tight leading-none',
    md: 'text-lg font-black tracking-tight leading-none',
    lg: 'text-2xl font-black tracking-tight leading-none',
    xl: 'text-4xl font-black tracking-tight leading-none',
  };

  const webTextSizes = {
    sm: 'text-[9px] font-bold tracking-[0.2em] leading-none',
    md: 'text-[11px] font-bold tracking-[0.22em] leading-none',
    lg: 'text-xs font-bold tracking-[0.25em] leading-none',
    xl: 'text-sm font-bold tracking-[0.28em] leading-none',
  };

  // The official geometric FINEX Arrow-F Icon
  const LogoIcon = (
    <div className={`${iconDimensions[size]} shrink-0 flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Upper structure: Top bar with right slant cut + embedded forward arrow */}
        <path
          d="M16 12H88L72 32H38V44H58V36L86 54L58 72V64H48L16 38V12Z"
          fill={iconFill}
        />
        {/* Lower stem with matching 45-degree angle slice */}
        <path
          d="M16 52L40 70V88H16V52Z"
          fill={iconFill}
        />
      </svg>
    </div>
  );

  // Icon only presentation
  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  // Stacked Logo presentation (Icon on top, FINEX and WEB underneath)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {LogoIcon}
        <div className="mt-2.5 flex flex-col items-center">
          <span className={`text-white font-['Poppins',sans-serif] ${finexTextSizes[size]}`}>
            FINEX
          </span>
          <span className={`text-white font-['Poppins',sans-serif] ${webTextSizes[size]} mt-1 text-zinc-300`}>
            WEB
          </span>
          {showTagline && (
            <span className="text-[10px] text-[#8C9398] font-mono tracking-wider uppercase mt-1">
              Private Agency OS
            </span>
          )}
        </div>
      </div>
    );
  }

  // Primary horizontal presentation (Icon + FINEX / WEB with signature trailing line)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col justify-center min-w-[70px]">
        {/* Top wordmark: FINEX in bold Poppins */}
        <div className="flex items-center">
          <span className={`text-white font-['Poppins',sans-serif] ${finexTextSizes[size]}`}>
            FINEX
          </span>
        </div>

        {/* Bottom wordmark: WEB with brand signature horizontal rule */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-white font-['Poppins',sans-serif] ${webTextSizes[size]}`}>
            WEB
          </span>
          <div className="flex-1 h-[1.5px] bg-white/80 rounded-full min-w-[16px]" />
        </div>

        {showTagline && (
          <span className="text-[9px] text-[#8C9398] font-mono tracking-wider uppercase mt-0.5">
            Operating System
          </span>
        )}
      </div>
    </div>
  );
};
