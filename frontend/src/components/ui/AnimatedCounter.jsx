import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedCounter - Smooth numerical count-up animation on scroll entrance
 */
export const AnimatedCounter = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Extract numerical digits from strings like '4,200+', '320+', '89%'
    const match = value.match(/(\d[\d,]*)/);
    if (!match) return;

    const rawNumStr = match[1].replace(/,/g, '');
    const targetNum = parseInt(rawNumStr, 10);
    if (isNaN(targetNum)) return;

    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + match[1].length);

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          const duration = 1200; // ms
          const startTime = performance.now();

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease-out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentNum = Math.floor(easeOut * targetNum);

            const formatted = currentNum.toLocaleString();
            setDisplayValue(`${prefix}${formatted}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(step);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [value]);

  return (
    <div ref={containerRef} className="stat-card">
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '0.5rem',
        }}
      >
        {displayValue}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
};

export default AnimatedCounter;

