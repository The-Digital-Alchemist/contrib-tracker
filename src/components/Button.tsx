import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'positive' | 'negative' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'neutral',
      size = 'medium',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClasses = clsx(
      // Base button styles
      'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
      
      // Variant styles - Ubuntu themed
      {
        'bg-ubuntu-orange-500 text-white hover:bg-ubuntu-orange-600 focus:ring-ubuntu-orange-500 hover:shadow-lg': variant === 'primary',
        'bg-ubuntu-grey-200 text-ubuntu-cool-500 hover:bg-ubuntu-grey-300 focus:ring-ubuntu-grey-500': variant === 'secondary',
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500': variant === 'positive',
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'negative',
        'bg-ubuntu-grey-100 text-ubuntu-cool-600 hover:bg-ubuntu-grey-200 focus:ring-ubuntu-grey-500': variant === 'neutral',
      },

      // Size styles
      {
        'px-3 py-1.5 text-sm': size === 'small',
        'px-4 py-2 text-base': size === 'medium',
        'px-6 py-3 text-lg': size === 'large',
      },

      // Full width
      {
        'w-full': fullWidth,
      },

      // Disabled state
      {
        'opacity-50 cursor-not-allowed': isDisabled,
      },

      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 