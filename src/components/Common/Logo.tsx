import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const emblemSizes = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-9 h-9 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${emblemSizes[size]} bg-gradient-to-tr from-[#00A86B] via-[#00C269] to-[#34D186] flex items-center justify-center text-white font-black shadow-sm shadow-emerald-500/25 tracking-tight flex-shrink-0 relative overflow-hidden`}
      >
        <Zap className={`${iconSizes[size]} fill-white text-white`} />
      </div>
      {showText && (
        <span className={`font-black text-gray-900 dark:text-white tracking-tight ${textSizes[size]} font-sans transition-colors`}>
          Campus<span className="text-[#00C269]">Go</span>
        </span>
      )}
    </div>
  );
};
