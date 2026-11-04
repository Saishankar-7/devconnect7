import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-main)',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  margin: '4px 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

