import React from 'react';
import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dc-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="dc-node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      {/* Rounded squircle background */}
      <rect width="40" height="40" rx="10" fill="#172554" />

      {/* Connecting Bridge Arc */}
      <path
        d="M10 26C13.5 16.5 26.5 16.5 30 26"
        stroke="url(#dc-logo-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Bridge Suspension Lines */}
      <line x1="16" y1="21" x2="16" y2="28" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <line x1="20" y1="18.5" x2="20" y2="28" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="24" y1="21" x2="24" y2="28" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

      {/* Bottom base deck */}
      <path
        d="M9 28H31"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Nodes / Stars of Opportunity */}
      <circle cx="10" cy="26" r="2.4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="30" cy="26" r="2.4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="20" cy="13" r="2.5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.2" />

      {/* Upward pulse chevron */}
      <path
        d="M18 10L20 8L22 10"
        stroke="#60A5FA"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Logo = ({ size = 'md', to = '/', showText = true, className = '' }) => {
  const pixelSizes = {
    sm: 26,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '10px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
      className={className}
    >
      <LogoMark size={pixelSizes[size] || 32} />
      {showText && (
        <span
          style={{
            fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
            fontWeight: 800,
            fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.35rem' : size === 'xl' ? '1.6rem' : '1.2rem',
            letterSpacing: '-0.03em',
            color: '#172554',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          Dev<span style={{ color: '#3B82F6', marginLeft: '1px' }}>Connect</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};

export default Logo;

