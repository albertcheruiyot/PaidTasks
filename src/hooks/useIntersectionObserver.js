// src/hooks/useIntersectionObserver.js

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect when an element enters the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {Number} options.threshold - Value between 0 and 1 indicating percentage visible needed to trigger
 * @param {String} options.root - Element that is used as the viewport for checking visibility
 * @param {String} options.rootMargin - Margin around the root element
 * @returns {[React.RefObject, boolean]} - A reference to attach to the target element and a boolean indicating if it's visible
 */
const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Update state when intersection status changes
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: options.threshold || 0.1,
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
    });

    observer.observe(ref);

    // Cleanup function
    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return [setRef, isVisible];
};

export default useIntersectionObserver;