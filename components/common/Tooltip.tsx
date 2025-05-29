import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  text: string;
  children: React.ReactNode; // Allow any ReactNode for children
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // Allow passing className to the wrapper span
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  // Store calculated style for the tooltip
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    visibility: 'hidden', // Initially hidden until position is calculated
    // top, left will be set by useLayoutEffect
  });
  const triggerWrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => setIsVisible(true), []);
  const hideTooltip = useCallback(() => {
    setIsVisible(false);
    // Reset style so it's hidden for next show, preventing flash of old position
    setTooltipStyle(prev => ({ ...prev, visibility: 'hidden' }));
  }, []);
  
  const calculateAndSetPosition = useCallback(() => {
    if (triggerWrapperRef.current && tooltipRef.current) {
      const triggerRect = triggerWrapperRef.current.getBoundingClientRect();
      const tooltipEl = tooltipRef.current; // Tooltip DOM element
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const arrowOffset = 8; // Approximate size of arrow + margin (e.g., from m-2 or similar)

      let newTop = 0;
      let newLeft = 0;

      // Calculate initial position based on 'position' prop
      switch (position) {
        case 'top':
          newTop = triggerRect.top + scrollY - tooltipEl.offsetHeight - arrowOffset;
          newLeft = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipEl.offsetWidth / 2);
          break;
        case 'bottom':
          newTop = triggerRect.bottom + scrollY + arrowOffset;
          newLeft = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipEl.offsetWidth / 2);
          break;
        case 'left':
          newTop = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipEl.offsetHeight / 2);
          newLeft = triggerRect.left + scrollX - tooltipEl.offsetWidth - arrowOffset;
          break;
        case 'right':
          newTop = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipEl.offsetHeight / 2);
          newLeft = triggerRect.right + scrollX + arrowOffset;
          break;
      }
      
      // Boundary adjustments to keep tooltip within viewport
      // Adjust left boundary
      if (newLeft < scrollX + arrowOffset) {
          newLeft = scrollX + arrowOffset;
      }
      // Adjust right boundary
      if (newLeft + tooltipEl.offsetWidth > scrollX + window.innerWidth - arrowOffset) {
          newLeft = scrollX + window.innerWidth - tooltipEl.offsetWidth - arrowOffset;
      }
      // Adjust top boundary
      if (newTop < scrollY + arrowOffset) {
          newTop = scrollY + arrowOffset;
      }
      // Adjust bottom boundary, with potential flip
      if (newTop + tooltipEl.offsetHeight > scrollY + window.innerHeight - arrowOffset) {
        // If original position was 'bottom' and flipping to 'top' is viable (fits better)
        if (position === 'bottom' && (triggerRect.top + scrollY - tooltipEl.offsetHeight - arrowOffset) > scrollY + arrowOffset) {
            newTop = triggerRect.top + scrollY - tooltipEl.offsetHeight - arrowOffset;
        // If original position was 'top' and flipping to 'bottom' is viable
        } else if (position === 'top' && (triggerRect.bottom + scrollY + arrowOffset + tooltipEl.offsetHeight) < scrollY + window.innerHeight - arrowOffset) {
             newTop = triggerRect.bottom + scrollY + arrowOffset;
        } else { // Otherwise, stick to the edge
            newTop = scrollY + window.innerHeight - tooltipEl.offsetHeight - arrowOffset;
        }
        // Final check if it still overflows top after potential flip or sticking to edge
        if (newTop < scrollY + arrowOffset) {
            newTop = scrollY + arrowOffset;
        }
      }

      setTooltipStyle({
        position: 'absolute',
        top: `${newTop}px`,
        left: `${newLeft}px`,
        visibility: 'visible',
      });
    }
  }, [position]);

  useLayoutEffect(() => {
    if (isVisible) {
      // The tooltip DOM element (tooltipRef.current) must exist and be measurable.
      // It is rendered when isVisible is true. useLayoutEffect runs after render.
      calculateAndSetPosition();
    }
  }, [isVisible, calculateAndSetPosition]);

  // Effect to handle scroll and resize for repositioning
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', calculateAndSetPosition, true); // useCapture = true
      window.addEventListener('resize', calculateAndSetPosition);
      return () => {
        window.removeEventListener('scroll', calculateAndSetPosition, true);
        window.removeEventListener('resize', calculateAndSetPosition);
      };
    }
  }, [isVisible, calculateAndSetPosition]);

  const tooltipJsx = (
    <div
      ref={tooltipRef}
      role="tooltip"
      style={tooltipStyle} // Apply dynamic style: position, top, left, visibility
      className={`z-[60] px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-90 whitespace-nowrap`}
    >
      {text}
      <div /* Arrow */
        className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 
          ${position === 'top' ? 'left-1/2 -translate-x-1/2 top-full -mt-1' : ''}
          ${position === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-full -mb-1' : ''}
          ${position === 'left' ? 'top-1/2 -translate-y-1/2 left-full -ml-1' : ''}
          ${position === 'right' ? 'top-1/2 -translate-y-1/2 right-full -mr-1' : ''}
        `}
      />
    </div>
  );
  
  const wrapperClassName = `relative inline-block ${className || ''}`;

  return (
    <span
      ref={triggerWrapperRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className={wrapperClassName}
      // tabIndex might be needed if `children` is not inherently focusable,
      // e.g., tabIndex={0} on the span. For now, assuming children like Buttons are focusable.
    >
      {children}
      {isVisible && ReactDOM.createPortal(tooltipJsx, document.body)}
    </span>
  );
};

export default Tooltip;
