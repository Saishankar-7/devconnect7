import React from 'react';

export const SkeletonBox = ({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) => (
  <div
    className="shimmer-box"
    style={{
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

export const SkeletonUserCard = () => (
  <div
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-main)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-xs)',
    }}
  >
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SkeletonBox width="52px" height="52px" borderRadius="14px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonBox width="60%" height="18px" />
        <SkeletonBox width="40%" height="14px" />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonBox width="100%" height="12px" />
      <SkeletonBox width="75%" height="12px" />
    </div>
    <div style={{ display: 'flex', gap: '6px' }}>
      <SkeletonBox width="50px" height="22px" borderRadius="6px" />
      <SkeletonBox width="65px" height="22px" borderRadius="6px" />
      <SkeletonBox width="55px" height="22px" borderRadius="6px" />
    </div>
    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
      <SkeletonBox width="100%" height="36px" borderRadius="8px" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-main)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <SkeletonBox width="42px" height="42px" borderRadius="12px" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <SkeletonBox width="35%" height="16px" />
        <SkeletonBox width="20%" height="12px" />
      </div>
    </div>
    <SkeletonBox width="80px" height="26px" borderRadius="9999px" />
  </div>
);

