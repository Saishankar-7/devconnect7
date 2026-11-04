import React, { useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export const MessageBubble = ({ message, isMine }) => {
  const [showTime, setShowTime] = useState(false);

  const timeLabel = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        gap: '6px',
        marginBottom: '6px',
        animation: isMine
          ? 'msgSlideInRight 0.18s var(--ease-out-expo) forwards'
          : 'msgSlideInLeft 0.18s var(--ease-out-expo) forwards',
      }}
    >
      <div
        onClick={() => setShowTime((v) => !v)}
        style={{
          maxWidth: '75%',
          padding: '10px 14px 8px',
          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isMine
            ? message.failed
              ? '#FEF2F2'
              : '#3B82F6'
            : '#F1F5F9',
          color: isMine
            ? message.failed
              ? '#B91C1C'
              : '#FFFFFF'
            : '#0F172A',
          border: isMine
            ? message.failed
              ? '1px solid #FECACA'
              : 'none'
            : '1px solid #E2E8F0',
          boxShadow: isMine ? '0 2px 8px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          wordBreak: 'break-word',
          cursor: 'pointer',
          transition: 'transform 0.1s ease',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.90625rem', lineHeight: 1.5 }}>
          {message.content}
        </p>

        {/* Footer with time & delivery indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMine ? 'flex-end' : 'flex-start',
            gap: '4px',
            marginTop: '4px',
            fontSize: '0.6875rem',
            color: isMine ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
          }}
        >
          <span>{timeLabel}</span>

          {isMine && (
            <span>
              {message.pending ? (
                <Clock size={11} />
              ) : message.failed ? (
                <AlertCircle size={11} color="#EF4444" />
              ) : (
                <Check size={12} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
