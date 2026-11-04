import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal - High-performance viewport intersection animator
 * Triggers entrance CSS transitions when elements enter the viewport.
 */
export const ScrollReveal = ({
  children,
  className = '',
  stagger = false,
  threshold = 0.15,
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // If browser doesn't support IntersectionObserver, make visible immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [threshold]);

  const combinedClasses = `reveal-init ${isVisible ? 'is-visible' : ''} ${stagger ? 'reveal-stagger' : ''} ${className}`.trim();

  return (
    <div ref={elementRef} className={combinedClasses} style={style}>
      {children}
    </div>
  );
};

export default ScrollReveal;

