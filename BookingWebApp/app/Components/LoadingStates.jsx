import React from "react";

// Full page loading spinner
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></div>
      <p className="text-neutral-600 font-medium">{message}</p>
    </div>
  </div>
);

// Inline loading spinner
export const InlineLoader = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };
  
  return (
    <div className={`${sizeClasses[size]} border-primary-purple/30 border-t-primary-purple rounded-full animate-spin ${className}`}></div>
  );
};

// Skeleton loaders
export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className={`h-4 skeleton rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      ></div>
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
    <div className="aspect-video skeleton rounded-lg mb-4"></div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full skeleton ${className}`}></div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-neutral-200">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 h-4 skeleton rounded"></div>
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-2">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 h-4 skeleton rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

// Button loading state
export const LoadingButton = ({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  className = "",
  ...props 
}) => (
  <button
    disabled={isLoading}
    className={`relative ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <InlineLoader size="sm" />
        {loadingText}
      </span>
    ) : children}
  </button>
);

// Empty state component
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  actionLabel,
  className = "" 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {icon && (
      <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
    {description && (
      <p className="text-neutral-600 max-w-sm mb-4">{description}</p>
    )}
    {action && actionLabel && (
      <button
        onClick={action}
        className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple/90 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Error state component
export const ErrorState = ({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className = "" 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
    {message && (
      <p className="text-neutral-600 max-w-sm mb-4">{message}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple/90 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Overlay loading (for modals/forms)
export const OverlayLoader = ({ isVisible, message = "Please wait..." }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <InlineLoader size="md" />
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
    </div>
  );
};

