import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import MessageBubble from './MessageBubble';

// ─── Skeleton messages ────────────────────────────────────────────
const SkeletonMessages = () => (
  <div className="cb-skeleton-wrap">
    {[{ w: '55%', mine: false }, { w: '40%', mine: true }, { w: '65%', mine: false }, { w: '35%', mine: true }, { w: '50%', mine: false }]
      .map((s, i) => (
        <div key={i} className={`cb-sk-row ${s.mine ? 'cb-sk-row--mine' : ''}`}>
          {!s.mine && <div className="cb-sk-avatar" />}
          <div className="cb-sk-bubble" style={{ width: s.w }} />
        </div>
      ))}
  </div>
);

// ─── Date separator ───────────────────────────────────────────────
const DateSeparator = ({ label }) => (
  <div className="cb-date-sep">
    <span className="cb-date-sep__label">{label}</span>
  </div>
);

// ─── Group messages by date ───────────────────────────────────────
const groupByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (label !== lastDate) {
      groups.push({ type: 'separator', label, id: `sep-${label}` });
      lastDate = label;
    }
    groups.push({ type: 'message', msg });
  });
  return groups;
};

// ─── Main component ───────────────────────────────────────────────
const ChatBox = ({ activeUser }) => {
  const { user }   = useContext(AuthContext);
  const socket     = useContext(SocketContext);

  const [messages,    setMessages]    = useState([]);
  const [newMessage,  setNewMessage]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isTyping,    setIsTyping]    = useState(false);
  const [sending,     setSending]     = useState(false);

  const messagesEndRef  = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef        = useRef(null);
  const typingTimerRef  = useRef(null);

  // ── Socket room + receive messages ───────────────────────────────
  useEffect(() => {
    if (!user || !activeUser || !socket) return;
    const roomId = [user._id, activeUser._id].sort().join('_');
    socket.emit('joinRoom', roomId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        // 1. Check if this exact ID already exists
        if (prev.some((m) => m._id === message._id)) return prev;

        // 2. Reconciliation: check if we have an optimistic message with same content
        // produced in the last 5 seconds that matches this message.
        const now = new Date();
        const optimisticIndex = prev.findIndex(m => 
          m.pending && 
          m.sender === message.sender && 
          m.content === message.content &&
          (now - new Date(m.createdAt)) < 5000
        );

        if (optimisticIndex !== -1) {
          const newMsgs = [...prev];
          newMsgs[optimisticIndex] = message; // Swap placeholder with real data
          return newMsgs;
        }

        return [...prev, message];
      });
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === activeUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === activeUser._id) {
        setIsTyping(false);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping',     handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping',     handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
    };
  }, [user, activeUser, socket]);

  // ── Fetch messages on user change ────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!user || !activeUser) return;
    setLoading(true);
    setError(null);
    setMessages([]);
    try {
      const { data } = await axios.get(`/messages/${activeUser._id}`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Could not load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeUser, user]);

  useEffect(() => {
    fetchMessages();
    // Use preventScroll so the browser doesn't jump the whole page to the input
    inputRef.current?.focus({ preventScroll: true });
  }, [fetchMessages]);

  // ── Scroll to bottom ─────────────────────────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: messages.length <= 50 ? 'smooth' : 'auto' // smooth for small lists, instant for long ones
      });
    }
  }, [messages, isTyping]);

  // ── Typing emit ──────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    
    if (socket && activeUser) {
      const roomId = [user._id, activeUser._id].sort().join('_');
      if (val.trim()) {
        socket.emit('typing', { room: roomId, senderId: user._id });
        
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          socket.emit('stopTyping', { room: roomId, senderId: user._id });
        }, 3000);
      } else {
        socket.emit('stopTyping', { room: roomId, senderId: user._id });
      }
    }
  };

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !activeUser || sending) return;

    const roomId = [user._id, activeUser._id].sort().join('_');
    const tempId = `temp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      sender: user._id,
      receiver: activeUser._id,
      content: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    setSending(true);

    try {
      if (socket) {
        socket.emit('sendMessage', {
          senderId:   user._id,
          receiverId: activeUser._id,
          content:    trimmed,
          room:       roomId,
        });
        
        // Stop typing immediately on send
        socket.emit('stopTyping', { room: roomId, senderId: user._id });
      }
      
      // We don't mark as delivered here anymore because handleReceiveMessage 
      // will eventually receive the real message from the server.
      // However, to keep it smooth, we remove the "pending" flag after a short delay
      // or we can just wait for the receiver handler to swap it.
      // Re-implementing handleReceiveMessage logic below instead.
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
      );
    } finally {
      setSending(false);
    }
  };

  // ── Enter to send, Shift+Enter for newline ────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const items = groupByDate(messages);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .cb-root {
          --cb-bg:        #070c18;
          --cb-surface:   #0f172a;
          --cb-surface-2: #1e293b;
          --cb-surface-3: #263548;
          --cb-border:    rgba(99,179,237,0.1);
          --cb-accent:    #38bdf8;
          --cb-accent-2:  #818cf8;
          --cb-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
          --cb-glow:      rgba(56,189,248,0.1);
          --cb-text-1:    #f1f5f9;
          --cb-text-2:    #94a3b8;
          --cb-text-3:    #64748b;
          --cb-danger:    #ef4444;
          font-family: 'DM Sans', sans-serif;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--cb-bg);
          min-width: 0;
        }

        /* ── Header ── */
        .cb-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--cb-border);
          background: var(--cb-surface);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .cb-header__avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid var(--cb-border);
          flex-shrink: 0;
        }

        .cb-header__avatar-placeholder {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: var(--cb-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .cb-header__info { flex: 1; min-width: 0; }

        .cb-header__name {
          font-family: 'Syne', sans-serif;
          font-size: 0.975rem;
          font-weight: 700;
          color: var(--cb-text-1);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cb-header__company {
          font-size: 0.775rem;
          color: var(--cb-accent);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cb-header__online {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: var(--cb-text-3);
          flex-shrink: 0;
        }

        .cb-header__online-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: cbPulse 2s ease-in-out infinite;
        }

        @keyframes cbPulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }

        /* ── Messages area ── */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.25rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scrollbar-width: thin;
          scrollbar-color: rgba(99,179,237,0.1) transparent;
        }

        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: var(--cb-surface-2); border-radius: 4px; }

        /* ── Date separator ── */
        .cb-date-sep {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 12px 0 8px;
        }

        .cb-date-sep__label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cb-text-3);
          background: var(--cb-surface-2);
          border: 1px solid var(--cb-border);
          padding: 4px 12px;
          border-radius: 100px;
        }

        /* ── Loading ── */
        .cb-skeleton-wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 0.5rem 0;
        }

        .cb-sk-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .cb-sk-row--mine { flex-direction: row-reverse; }

        .cb-sk-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: var(--cb-surface-2);
          flex-shrink: 0;
          animation: cbShimmer 1.4s ease-in-out infinite;
        }

        .cb-sk-bubble {
          height: 38px;
          border-radius: 14px;
          background: var(--cb-surface-2);
          animation: cbShimmer 1.4s ease-in-out infinite;
        }

        @keyframes cbShimmer {
          0%,100% { opacity: 0.5; } 50% { opacity: 1; }
        }

        /* ── Empty messages ── */
        .cb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          padding: 2rem;
        }

        .cb-empty__icon {
          font-size: 2.5rem;
          margin-bottom: 4px;
        }

        .cb-empty__title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--cb-text-1);
          margin: 0;
        }

        .cb-empty__sub {
          font-size: 0.85rem;
          color: var(--cb-text-3);
          margin: 0;
        }

        /* ── Error ── */
        .cb-error {
          margin: 1rem;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: var(--cb-danger);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cb-error__retry {
          background: rgba(239,68,68,0.12);
          border: none; border-radius: 7px;
          padding: 5px 12px;
          color: var(--cb-danger);
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: background 0.15s;
        }

        .cb-error__retry:hover { background: rgba(239,68,68,0.22); }

        /* ── Typing indicator ── */
        .cb-typing {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0 10px;
          animation: cbFadeIn 0.2s ease;
        }

        .cb-typing__avatar {
          width: 26px; height: 26px;
          border-radius: 7px;
          background: var(--cb-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem; font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .cb-typing__bubble {
          background: var(--cb-surface-2);
          border: 1px solid var(--cb-border);
          border-radius: 14px 14px 14px 4px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cb-typing__dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cb-text-3);
          animation: cbBounce 1.2s ease-in-out infinite;
        }

        .cb-typing__dot:nth-child(2) { animation-delay: 0.15s; }
        .cb-typing__dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes cbBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30%          { transform: translateY(-5px); opacity: 1; }
        }

        @keyframes cbFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Input area ── */
        .cb-input-area {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--cb-border);
          background: var(--cb-surface);
          flex-shrink: 0;
        }

        .cb-input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--cb-surface-2);
          border: 1.5px solid var(--cb-border);
          border-radius: 16px;
          padding: 8px 8px 8px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .cb-input-row:focus-within {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 0 0 3px var(--cb-glow);
        }

        .cb-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cb-text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          line-height: 1.5;
          resize: none;
          max-height: 120px;
          min-height: 24px;
          padding: 4px 0;
          scrollbar-width: none;
        }

        .cb-textarea::-webkit-scrollbar { display: none; }
        .cb-textarea::placeholder { color: var(--cb-text-3); }

        .cb-send-btn {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: var(--cb-gradient);
          border: none;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.2s;
        }

        .cb-send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .cb-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .cb-input-hint {
          text-align: right;
          font-size: 0.7rem;
          color: var(--cb-text-3);
          margin: 5px 4px 0;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .cb-header { padding: 0.9rem 1rem; }
          .cb-messages { padding: 1rem 0.9rem 0.5rem; }
          .cb-input-area { padding: 0.75rem 0.9rem; }
        }
      `}</style>

      <div className="cb-root">

        {/* ── Header ── */}
        <div className="cb-header">
          {activeUser.avatarUrl ? (
            <img src={activeUser.avatarUrl} alt={activeUser.name} className="cb-header__avatar" />
          ) : (
            <div className="cb-header__avatar-placeholder" aria-hidden="true">
              {activeUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="cb-header__info">
            <h2 className="cb-header__name">{activeUser.name}</h2>
            {activeUser.company && (
              <p className="cb-header__company">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {activeUser.company}
              </p>
            )}
          </div>
          <div className="cb-header__online" aria-label="Online">
            <span className="cb-header__online-dot" />
            Online
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="cb-error" role="alert">
            <span>⚠️ {error}</span>
            <button className="cb-error__retry" onClick={fetchMessages}>Retry</button>
          </div>
        )}

        {/* ── Messages ── */}
        <div 
          className="cb-messages" 
          role="log" 
          aria-live="polite" 
          aria-label="Messages"
          ref={scrollContainerRef}
        >
          {loading ? (
            <SkeletonMessages />
          ) : messages.length === 0 ? (
            <div className="cb-empty">
              <div className="cb-empty__icon">👋</div>
              <h3 className="cb-empty__title">Start the conversation</h3>
              <p className="cb-empty__sub">
                Say hello to <strong>{activeUser.name}</strong>!
              </p>
            </div>
          ) : (
            items.map((item) =>
              item.type === 'separator' ? (
                <DateSeparator key={item.id} label={item.label} />
              ) : (
                <MessageBubble
                  key={item.msg._id}
                  message={item.msg}
                  isMine={item.msg.sender === user?._id}
                />
              )
            )
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="cb-typing">
              <div className="cb-typing__avatar">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="cb-typing__bubble">
                <span className="cb-typing__dot" />
                <span className="cb-typing__dot" />
                <span className="cb-typing__dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="cb-input-area">
          <form onSubmit={sendMessage}>
            <div className="cb-input-row">
              <textarea
                ref={inputRef}
                className="cb-textarea"
                placeholder={`Message ${activeUser.name}…`}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                aria-label="Type a message"
              />
              <button
                type="submit"
                className="cb-send-btn"
                disabled={!newMessage.trim() || sending}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="cb-input-hint">Enter to send · Shift+Enter for new line</p>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
