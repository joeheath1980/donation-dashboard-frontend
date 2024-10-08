import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const tooltipStyle = {
  position: 'fixed',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '4px',
  fontSize: '14px',
  zIndex: 9999,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const InstantTooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const childRef = useRef(null);

  useEffect(() => {
    console.log('InstantTooltip rendered, isVisible:', isVisible);
  }, [isVisible]);

  const handleMouseEnter = () => {
    console.log('Mouse entered');
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 5, // Removed window.scrollY
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    console.log('Mouse left');
    setIsVisible(false);
  };

  // Use a portal to render the tooltip
  const renderTooltip = () => {
    return ReactDOM.createPortal(
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transition: 'opacity 0.1s ease-in-out, visibility 0.1s ease-in-out',
        }}
      >
        {text}
      </div>,
      document.body
    );
  };

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {renderTooltip()}
    </>
  );
};

InstantTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default InstantTooltip;