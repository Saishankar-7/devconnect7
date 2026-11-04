import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Smooth hardware-accelerated page entrance transition
 * Animates opacity (0 -> 1) and translateY (8px -> 0) in 240ms.
 */
export const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition-wrapper">
      {children}
    </div>
  );
};

export default PageTransition;

