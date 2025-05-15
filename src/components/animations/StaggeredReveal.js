// src/components/animations/StaggeredReveal.js

import React, { Children, cloneElement } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

/**
 * StaggeredReveal component that animates children in sequence
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {Number} props.staggerDelay - Delay between each child animation
 * @param {Number} props.initialDelay - Initial delay before animations start
 * @param {Number} props.threshold - Threshold for intersection observer (0-1)
 * @param {String} props.className - Additional CSS classes
 */
const StaggeredReveal = ({ 
  children, 
  staggerDelay = 0.1, 
  initialDelay = 0,
  threshold = 0.1,
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold });

  // Clone children with staggered delay
  const staggeredChildren = Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        style: {
          ...child.props.style,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 0.5s ease ${initialDelay + (index * staggerDelay)}s, transform 0.5s ease ${initialDelay + (index * staggerDelay)}s`
        }
      });
    }
    return child;
  });

  return (
    <div
      ref={ref}
      className={className}
    >
      {staggeredChildren}
    </div>
  );
};

export default StaggeredReveal;