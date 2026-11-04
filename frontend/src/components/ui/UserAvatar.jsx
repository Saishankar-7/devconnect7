import React from 'react';

export const UserAvatar = ({
  user,
  name,
  avatarUrl,
  role,
  size = 'md',
  showRoleDot = false,
  className = '',
}) => {
  const finalName = name || user?.name || 'User';
  const finalAvatar = avatarUrl || user?.avatarUrl;
  const finalRole = role || user?.role;
  const initial = finalName.charAt(0).toUpperCase() || '?';

  const sizeStyles = {
    xs: { width: '28px', height: '28px', fontSize: '0.75rem', radius: '8px', dotSize: '8px' },
    sm: { width: '36px', height: '36px', fontSize: '0.875rem', radius: '10px', dotSize: '10px' },
    md: { width: '44px', height: '44px', fontSize: '1.05rem', radius: '12px', dotSize: '11px' },
    lg: { width: '56px', height: '56px', fontSize: '1.25rem', radius: '14px', dotSize: '13px' },
    xl: { width: '80px', height: '80px', fontSize: '1.75rem', radius: '18px', dotSize: '16px' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Generate deterministic gentle background color based on name
  const getGradient = (str) => {
    const gradients = [
      'linear-gradient(135deg, #172554 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%)',
      'linear-gradient(135deg, #0F766E 0%, #06B6D4 100%)',
      'linear-gradient(135deg, #4338CA 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #0369A1 0%, #2563EB 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return gradients[hash % gradients.length];
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: currentSize.width,
        height: currentSize.height,
        flexShrink: 0,
      }}
      className={className}
    >
      {finalAvatar ? (
        <img
          src={finalAvatar}
          alt={finalName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: currentSize.radius,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onError={(e) => {
            // Fallback if image fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        style={{
          display: finalAvatar ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: currentSize.radius,
          background: getGradient(finalName),
          color: '#ffffff',
          fontWeight: 700,
          fontFamily: "var(--font-heading, sans-serif)",
          fontSize: currentSize.fontSize,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          letterSpacing: '-0.02em',
        }}
        aria-hidden="true"
      >
        {initial}
      </div>

      {showRoleDot && (
        <span
          className={finalRole === 'employee' ? 'pulse-online' : ''}
          title={finalRole === 'employee' ? 'Verified Employee / Referrer' : 'Job Seeker'}
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: currentSize.dotSize,
            height: currentSize.dotSize,
            borderRadius: '50%',
            backgroundColor: finalRole === 'employee' ? '#16A34A' : '#7C3AED',
            border: '2px solid #ffffff',
            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;

