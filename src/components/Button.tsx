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
      'p-button',
      
      // Variant styles
      {
        'p-button--primary': variant === 'primary',
        'p-button--secondary': variant === 'secondary',
        'p-button--positive': variant === 'positive',
        'p-button--negative': variant === 'negative',
        'p-button--neutral': variant === 'neutral',
      },

      // Size styles
      {
        'p-button--small': size === 'small',
        'p-button--large': size === 'large',
      },

      // Full width
      {
        'u-full-width': fullWidth,
      },

      // Disabled state
      {
        'is-disabled': isDisabled,
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
          <span className="p-icon--spinner u-animation--spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="p-button__icon">{icon}</span>
        )}
        
        {children && (
          <span className="p-button__text">{children}</span>
        )}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="p-button__icon">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 