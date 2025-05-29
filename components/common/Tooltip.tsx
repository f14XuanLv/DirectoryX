
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement; // Must be a single React element
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  const eventHandlers = {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, eventHandlers)}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-10 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-90 whitespace-nowrap ${positionClasses[position]}`}
        >
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 
            ${position === 'top' ? 'left-1/2 -translate-x-1/2 top-full -mt-1' : ''}
            ${position === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-full -mb-1' : ''}
            ${position === 'left' ? 'top-1/2 -translate-y-1/2 left-full -ml-1' : ''}
            ${position === 'right' ? 'top-1/2 -translate-y-1/2 right-full -mr-1' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;