import React, { useEffect, useRef } from 'react';

/**
 * DynamicStyleManager - A CSP-compliant component for managing dynamic styles
 * Replaces inline styles with CSS custom properties
 */

// Helper function to map color to gradient class
const getGradientClass = (color) => {
  const colorMap = {
    '#FFD700': 'gold',
    '#C0C0C0': 'silver', 
    '#CD7F32': 'bronze',
    '#2ECC71': 'green',
    '#E74C3C': 'red',
    '#3498DB': 'blue',
    '#9B59B6': 'purple',
    '#E67E22': 'orange'
  };
  
  return colorMap[color] || 'blue';
};

// Helper function to calculate stepped width
const getSteppedWidth = (percentage) => {
  const step = Math.round(percentage / 5) * 5;
  return `width-${Math.min(100, Math.max(0, step))}`;
};

// Component for dynamic width elements
export const DynamicWidth = ({ 
  width, 
  children, 
  className = '', 
  fallbackToStepped = false,
  ...props 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && !fallbackToStepped) {
      ref.current.style.setProperty('--width', width);
    }
  }, [width, fallbackToStepped]);
  
  if (fallbackToStepped && typeof width === 'string' && width.includes('%')) {
    const percentage = parseFloat(width);
    return (
      <div className={`${getSteppedWidth(percentage)} ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  return (
    <div 
      ref={ref}
      className={`dynamic-width ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Component for progress bars
export const ProgressBar = ({ 
  progress, 
  total, 
  className = '',
  color,
  showIndicator = false,
  ...props 
}) => {
  const ref = useRef(null);
  const percentage = (progress / total) * 100;
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--progress', `${percentage}%`);
      if (color) {
        ref.current.style.setProperty('--color-start', `${color}dd`);
        ref.current.style.setProperty('--color-end', color);
      }
    }
  }, [percentage, color]);
  
  return (
    <div className="progress-container">
      <div 
        ref={ref}
        className={`progress-bar-fill ${className}`}
        {...props}
      />
      {showIndicator && (
        <div 
          className="progress-indicator"
          style={{ '--progress': `${percentage}%` }}
        />
      )}
    </div>
  );
};

// Component for gradient backgrounds
export const DynamicGradient = ({ 
  color, 
  type = '135deg',
  opacity = 'dd',
  children,
  className = '',
  ...props 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && color) {
      const gradient = `linear-gradient(${type}, ${color}${opacity}, ${color})`;
      ref.current.style.setProperty('--gradient', gradient);
    }
  }, [color, type, opacity]);
  
  // Fallback to data attribute approach
  const gradientColor = getGradientClass(color);
  
  return (
    <div 
      ref={ref}
      className={`dynamic-gradient ${className}`}
      data-gradient-color={gradientColor}
      {...props}
    >
      {children}
    </div>
  );
};

// Component for tooltip positioning
export const DynamicTooltip = ({ 
  x, 
  y, 
  position,
  children,
  className = '',
  ...props 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current) {
      if (x !== undefined) ref.current.style.setProperty('--x', `${x}px`);
      if (y !== undefined) ref.current.style.setProperty('--y', `${y}px`);
    }
  }, [x, y]);
  
  // Use preset positions if provided
  if (position) {
    return (
      <div 
        className={`tooltip-${position} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div 
      ref={ref}
      className={`dynamic-tooltip ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Component for complex positioning
export const DynamicPosition = ({ 
  top, 
  left, 
  right, 
  bottom,
  children,
  className = '',
  ...props 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current) {
      if (top !== undefined) ref.current.style.setProperty('--top', top);
      if (left !== undefined) ref.current.style.setProperty('--left', left);
      if (right !== undefined) ref.current.style.setProperty('--right', right);
      if (bottom !== undefined) ref.current.style.setProperty('--bottom', bottom);
    }
  }, [top, left, right, bottom]);
  
  return (
    <div 
      ref={ref}
      className={`position-dynamic ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook for managing dynamic styles
export const useDynamicStyles = (elementRef, styles) => {
  useEffect(() => {
    if (elementRef.current && styles) {
      Object.entries(styles).forEach(([property, value]) => {
        elementRef.current.style.setProperty(`--${property}`, value);
      });
    }
  }, [elementRef, styles]);
};

// Export all components
export default {
  DynamicWidth,
  ProgressBar,
  DynamicGradient,
  DynamicTooltip,
  DynamicPosition,
  useDynamicStyles
};