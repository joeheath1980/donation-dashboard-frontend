import React from 'react';

/**
 * DynamicStyleWrapper - Component for handling dynamic CSS variables without inline styles
 * This component uses data attributes and CSS to apply dynamic values
 */

const DynamicStyleWrapper = ({ 
  children, 
  cssVariables = {},
  className = '',
  ...props 
}) => {
  // Convert CSS variables to data attributes
  const dataAttributes = {};
  
  Object.entries(cssVariables).forEach(([key, value]) => {
    // Convert --tier-color to data-tier-color
    const attrName = key.replace('--', 'data-');
    dataAttributes[attrName] = value;
  });
  
  return (
    <div 
      className={`dynamic-style-wrapper ${className}`.trim()}
      {...dataAttributes}
      {...props}
    >
      {children}
    </div>
  );
};

export default DynamicStyleWrapper;