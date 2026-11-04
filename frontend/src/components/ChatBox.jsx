import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import UserAvatar from './ui/UserAvatar';
import { RoleBadge } from './ui/Badge';
import { Link } from 'react-router-dom';
import { Send, User, Sparkles, Building2 } from 'lucide-react';

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
      groups.push({ type: 'separator', label, id: `sep-${label}-${d.getTime()}` });
      lastDate = label;
    }
    groups.push({ type: 'message', msg });
  });

  return groups;
};

export const ChatBox = ({ activeUser }) => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Join Room & socket listeners
  useEffect(() => {
    if (!user || !activeUser || !socket) return;
    const roomId = [user._id, activeUser._id].sort().join('_');
    socket.emit('joinRoom', roomId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;

        // Reconcile optimistic message
        const optimisticIndex = prev.findIndex(
          (m) => m.pending && m.sender === message.sender && m.content === message.content
        );

        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = message;
          return updated;
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
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
    };
  }, [user, activeUser, socket]);

  // Fetch messages history
  const fetchMessages = useCallback(async () => {
    if (!user || !activeUser) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/messages/${activeUser._id}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeUser]);

  useEffect(() => {
    fetchMessages();
    inputRef.current?.focus({ preventScroll: true });
  }, [fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

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
        }, 2500);
      } else {
        socket.emit('stopTyping', { room: roomId, senderId: user._id });
      }
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
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
          senderId: user._id,
          receiverId: activeUser._id,
          content: trimmed,
          room: roomId,
        });
        socket.emit('stopTyping', { room: roomId, senderId: user._id });
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const items = groupByDate(messages);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Chat Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-main)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserAvatar user={activeUser} size="md" showRoleDot={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {activeUser.name}
              </h3>
              <RoleBadge role={activeUser.role} company={activeUser.company} size="sm" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {activeUser.role === 'employee' ? `${activeUser.company || 'Tech Company'} Employee` : 'Developer / Job Seeker'}
            </div>
          </div>
        </div>

        <Link
          to={`/profile/${activeUser._id}`}
          className="btn btn-secondary btn-sm"
        >
          <User size={14} />
          View Profile
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Loading conversation history...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '360px',
              padding: '2rem 1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Sparkles size={22} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>
              Start of your conversation
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Send a message to introduce yourself, discuss referral opportunities, or share advice.
            </p>
          </div>
        ) : (
          items.map((item) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '1.25rem 0',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      backgroundColor: '#E2E8F0',
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }

            const isMine = item.msg.sender === user._id;
            return (
              <MessageBubble
                key={item.msg._id}
                message={item.msg}
                isMine={isMine}
              />
            );
          })
        )}

        {/* Typing indicator with animated dots */}
        {isTyping && (
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              width: 'fit-content',
              animation: 'slideUp 0.15s var(--ease-out-expo) forwards',
              marginBottom: '6px',
            }}
          >
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginLeft: '4px',
                fontWeight: 500,
              }}
            >
              {activeUser.name.split(' ')[0]} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Message Input Bar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-main)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder={`Message ${activeUser.name}... (Press Enter to send)`}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '10px 16px',
              backgroundColor: '#F8FAFC',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!newMessage.trim() || sending}
            style={{ borderRadius: 'var(--radius-lg)', padding: '10px 18px', flexShrink: 0 }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
