import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import MessageBubble from './MessageBubble';

const ChatBox = ({ activeUser }) => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !activeUser || !socket) return;

    // Create a unique room ID for the two users
    const roomId = [user._id, activeUser._id].sort().join('_');

    // Join room
    socket.emit('joinRoom', roomId);

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [user, activeUser, socket]);

  useEffect(() => {
    if (!user || !activeUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/messages/${activeUser._id}`);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [activeUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    const roomId = [user._id, activeUser._id].sort().join('_');
    const messageData = {
      senderId: user._id,
      receiverId: activeUser._id,
      content: newMessage,
      room: roomId
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
    }

    // Optimistically add to UI
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        sender: user._id,
        receiver: activeUser._id,
        content: newMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    setNewMessage('');
  };

  if (!activeUser) {
    return (
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      {/* Chat Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {activeUser.avatarUrl ? (
          <img src={activeUser.avatarUrl} alt={activeUser.name} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {activeUser.name.charAt(0)}
          </div>
        )}
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{activeUser.name}</h2>
          {activeUser.company && <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', margin: 0 }}>{activeUser.company}</p>}
        </div>
      </div>

      {/* Messages List */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} isMine={msg.sender === user?._id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${activeUser.name}...`}
            className="input-field"
            style={{ flexGrow: 1, borderRadius: '2rem', padding: '0.8rem 1.5rem', border: '1px solid var(--border-color)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '2rem', padding: '0 1.5rem', fontWeight: '600' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
