import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'subtle' | 'saffron' | 'vastu';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 h-12',
    };

    const variantStyles = {
      primary:
        'bg-[#0B1B30] text-white hover:bg-[#153257] focus:ring-[#0B1B30] border border-white/10 shadow-xs hover:shadow-sm font-bold',
      secondary:
        'bg-[#0369A1] text-white hover:bg-[#0284C7] focus:ring-[#0369A1] shadow-xs hover:shadow-sm font-bold',
      saffron:
        'bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-md shadow-amber-600/20 focus:ring-amber-500',
      vastu:
        'bg-[#0B1B30] hover:bg-[#153257] text-amber-300 font-black border border-[#D4AF37]/30 shadow-md focus:ring-amber-400',
      outline:
        'border border-[#E8DFC8] bg-white/90 text-stone-700 hover:bg-[#FAF7F2] hover:text-stone-950 hover:border-[#D4AF37]/60 focus:ring-amber-300 font-bold',
      subtle:
        'bg-[#FAF7F2] text-stone-700 hover:bg-[#EFE7D8] focus:ring-amber-300 font-semibold',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-xs font-bold',
      ghost:
        'bg-transparent text-stone-600 hover:bg-[#FAF7F2] hover:text-stone-900 focus:ring-amber-300 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
