import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-base font-extrabold tracking-tight',
    lg: 'text-xl font-black tracking-tight',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Precision Geometric Emblem */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-[#1c1c1f] to-[#0c0d0e] border border-white/10 rounded-md flex items-center justify-center relative overflow-hidden shadow-sm shrink-0`}
      >
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#E52D27] rounded-bl" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* F and W monogram in red and crisp white */}
          <path
            d="M7 6H25V10H13V14H21V18H13V26H7V6Z"
            fill="#FFFFFF"
          />
          <path
            d="M17 14L22 26H26L21 14H17Z"
            fill="#E52D27"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`text-white font-['Plus_Jakarta_Sans'] ${textSizes[size]}`}>
            FINEX
          </span>
          <span className={`text-[#E52D27] font-['Plus_Jakarta_Sans'] ${textSizes[size]}`}>
            WEB
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-1">
            Agency OS · Admin
          </span>
        )}
      </div>
    </div>
  );
};
