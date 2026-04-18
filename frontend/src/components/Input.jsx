import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full outline-none transition-all duration-200 text-sm placeholder-gray-400';
  
  const variantClasses = {
    default: 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    filled: 'bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    underlined: 'bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 rounded-none px-0',
    error: 'bg-red-50 border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-3 py-2 text-sm rounded-lg',
    lg: 'px-4 py-3 text-base rounded-lg'
  };

  const stateClasses = {
    disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
    readOnly: 'bg-gray-50 cursor-default',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };

  const inputClasses = [
    baseClasses,
    variantClasses[error ? 'error' : variant],
    sizeClasses[size],
    disabled && stateClasses.disabled,
    readOnly && stateClasses.readOnly,
    error && stateClasses.error,
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'relative',
    containerClassName
  ].filter(Boolean).join(' ');

  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    const iconClasses = position === 'left' 
      ? 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
      : 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400';
    
    return (
      <span className={iconClasses}>
        {icon}
      </span>
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className={`block font-medium text-gray-700 text-sm ${
            error ? 'text-red-600' : ''
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={containerClasses}>
        {renderIcon(leftIcon, 'left')}
        
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText || error ? `${name}-help` : undefined}
          {...props}
        />
        
        {renderIcon(rightIcon, 'right')}
      </div>
      
      {(error || helperText) && (
        <p
          id={`${name}-help`}
          className={`text-xs ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
