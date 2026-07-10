import React from 'react';

/**
 * Mobile-first Button
 * - Touch-friendly min height on small screens
 * - Scales padding/type up from sm breakpoint
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ' +
    'min-h-[44px] sm:min-h-0 touch-manipulation select-none';

  const variantClasses = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm dark:bg-blue-500 dark:hover:bg-blue-400',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    ghost:
      'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-slate-200 dark:hover:bg-slate-800',
    link: 'text-blue-500 hover:text-blue-600 hover:underline focus:ring-blue-500 p-0 min-h-0',
  };

  // Mobile-first sizes: larger tap area by default, tighten on sm+
  const sizeClasses = {
    xs: 'text-xs px-3 py-2 sm:px-2.5 sm:py-1.5',
    sm: 'text-sm px-3.5 py-2.5 sm:px-3 sm:py-2',
    md: 'text-sm px-4 py-3 sm:py-2.5',
    lg: 'text-base px-5 py-3.5 sm:px-6 sm:py-3',
    xl: 'text-lg px-6 py-4 sm:px-8',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  // fullWidth on mobile by default when fullWidth prop set; always allow override
  const widthClasses = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    disabledClasses,
    widthClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
          <span className="truncate">{children}</span>
          {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
};

export default Button;
