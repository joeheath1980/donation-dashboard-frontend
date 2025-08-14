import React from 'react';

/**
 * CSPSafeWrapper - A component that provides CSP-compliant dynamic styling
 * Use this instead of inline styles for dynamic values
 */
const CSPSafeWrapper = ({ 
  children, 
  width, 
  height, 
  display, 
  gap, 
  margin,
  marginTop,
  marginBottom,
  padding,
  fontSize,
  color,
  backgroundColor,
  flexDirection,
  justifyContent,
  alignItems,
  className = '',
  ...props 
}) => {
  const classes = [];
  
  // Add utility classes based on props
  if (width !== undefined) {
    if (typeof width === 'number' && width <= 100) {
      classes.push(`width-${Math.round(width / 5) * 5}`);
    } else if (width === '100%') {
      classes.push('width-100');
    }
  }
  
  if (height !== undefined) {
    if (height === '100%') {
      classes.push('height-100');
    }
  }
  
  if (display) {
    classes.push(`display-${display}`);
  }
  
  if (gap) {
    classes.push(`gap-${gap}`);
  }
  
  if (margin) {
    classes.push(`m-${margin}`);
  }
  
  if (marginTop) {
    classes.push(`mt-${marginTop}`);
  }
  
  if (marginBottom) {
    classes.push(`mb-${marginBottom}`);
  }
  
  if (padding) {
    classes.push(`p-${padding}`);
  }
  
  if (fontSize) {
    classes.push(`font-size-${fontSize}`);
  }
  
  if (color) {
    if (color === '#6c757d') {
      classes.push('text-muted');
    } else if (color === '#10b981') {
      classes.push('text-success');
    } else if (color === '#dc2626') {
      classes.push('text-danger');
    }
  }
  
  if (backgroundColor) {
    if (backgroundColor === 'white') {
      classes.push('bg-white');
    } else if (backgroundColor === '#f8f9fa') {
      classes.push('bg-light');
    }
  }
  
  if (flexDirection) {
    classes.push(`flex-${flexDirection}`);
  }
  
  if (justifyContent) {
    classes.push(`justify-${justifyContent}`);
  }
  
  if (alignItems) {
    classes.push(`align-${alignItems}`);
  }
  
  return (
    <div className={`${classes.join(' ')} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default CSPSafeWrapper;