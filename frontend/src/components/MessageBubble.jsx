import React from 'react';

const MessageBubble = ({ message, isMine }) => {
  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.8rem 1.2rem',
        borderRadius: isMine ? '1.5rem 1.5rem 0.2rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.2rem',
        backgroundColor: isMine ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
        color: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{message.content}</p>
        <span style={{ 
          fontSize: '0.7rem', 
          opacity: 0.7, 
          marginTop: '0.4rem', 
          display: 'block', 
          textAlign: isMine ? 'right' : 'left' 
        }}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
