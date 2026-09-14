import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSizes = isSm ? 'w-8 h-8 rounded-xl' : isLg ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-2xl';
  const fontSizes = isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl';

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Brand Icon Emblem */}
      <div className={`${iconSizes} flame-gradient flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 text-white" fill="currentColor">
          <path d="M50 14C43 25 30 34 30 51C30 67 39 77 50 84C61 77 70 67 70 51C70 34 57 25 50 14Z" fill="white" fillOpacity="0.3" />
          <path d="M50 26C45 34 37 41 37 54C37 65 43 73 50 78C57 73 63 65 63 54C63 41 55 34 50 26Z" fill="white" />
          <path d="M53 36L43 53H51L47 67L61 48H52L56 36H53Z" fill="#F97316" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div>
        <div className={`font-headline ${fontSizes} font-black italic tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5 leading-none`}>
          <span>Grab-N-Go</span>
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">
          Campus Speed Eat
        </p>
      </div>
    </div>
  );
}
