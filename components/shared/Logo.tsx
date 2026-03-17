import React from 'react';
import { Hexagon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  showWordmark = true,
  size = 'md',
  variant = 'dark'
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9'
  };

  const wordmarkSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const wordmarkColor = variant === 'dark' 
    ? 'text-[#fff0f5] group-hover:text-[#fda4af]' 
    : 'text-slate-900 group-hover:text-[#be123c]';

  const innerHexColor = variant === 'dark' ? '#fda4af' : '#be123c';

  return (
    <div 
      className={cn(
        "group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md",
        className
      )}
      tabIndex={0}
    >
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        <Hexagon 
          className={cn(
            "absolute inset-0 text-[#f43f5e] transition-transform duration-700 ease-out",
            "drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]",
            "group-hover:rotate-180",
            "motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          )}
          strokeWidth={2}
        />
        <Hexagon 
          className="absolute inset-0 scale-[0.45] rotate-90"
          style={{ color: innerHexColor }}
          strokeWidth={2}
        />
      </div>
      
      {showWordmark && (
        <span 
          className={cn(
            "font-logo font-black tracking-tight transition-colors duration-300",
            wordmarkColor,
            wordmarkSizes[size]
          )}
        >
          pomegranate
        </span>
      )}
    </div>
  );
};
