// src/components/animations/FadeIn.js

import React from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

/**
 * FadeIn component that animates children when they enter the viewport
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {String} props.direction - Direction of animation: 'up', 'down', 'left', 'right'
 * @param {Number} props.duration - Animation duration in seconds
 * @param {Number} props.delay - Animation delay in seconds
 * @param {Number} props.threshold - Threshold for intersection observer (0-1)
 * @param {String} props.className - Additional CSS classes
 */
const FadeIn = ({ 
  children, 
  direction = 'up', 
  duration = 0.6, 
  delay = 0, 
  threshold = 0.1,
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold });

  // Define transform values based on direction
  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      default: return 'translateY(30px)';
    }
  };

  const styles = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0)' : getTransform(),
    transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`
  };

  return (
    <div
      ref={ref}
      style={styles}
      className={className}
    >
      {children}
    </div>
  );
};

export default FadeIn;