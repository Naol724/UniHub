import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  image,
  footer,
  actions,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'border-0',
    outlined: 'border-2 border-gray-300',
    success: 'border border-green-200 bg-green-50',
    warning: 'border border-yellow-200 bg-yellow-50',
    danger: 'border border-red-200 bg-red-50',
    info: 'border border-blue-200 bg-blue-50'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';

  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    shadowClasses[shadow],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    );
  };

  const renderImage = () => {
    if (!image) return null;

    return (
      <div className="mb-4 -mx-4 -mt-4">
        <img
          src={image.src}
          alt={image.alt || ''}
          className={`w-full object-cover ${
            image.height ? `h-${image.height}` : 'h-48'
          }`}
        />
      </div>
    );
  };

  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                action.variant === 'primary'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : action.variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        {typeof footer === 'string' ? (
          <p className="text-sm text-gray-600">{footer}</p>
        ) : (
          footer
        )}
      </div>
    );
  };

  const cardContent = (
    <div className={paddingClasses[padding]}>
      {renderHeader()}
      {renderImage()}
      <div className="text-gray-700">
        {children}
      </div>
      {renderActions()}
      {renderFooter()}
    </div>
  );

  if (onClick) {
    return (
      <div
        className={cardClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
        {...props}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {cardContent}
    </div>
  );
};

// Card sub-components for more complex layouts
const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`text-gray-700 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardMedia = ({ src, alt, height = '48', className = '' }) => (
  <div className={`mb-4 -mx-4 -mt-4 ${className}`}>
    <img
      src={src}
      alt={alt || ''}
      className={`w-full object-cover h-${height}`}
    />
  </div>
);

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;

export default Card;
export { CardHeader, CardBody, CardFooter, CardMedia };
