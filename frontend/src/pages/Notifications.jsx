import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/ui/UserAvatar';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Briefcase, 
  ExternalLink,
  CheckCheck,
  Sparkles
} from 'lucide-react';

function timeAgo(date) {
  if (!date) return '';
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const Notifications = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [authLoading, user, navigate, fetchNotifications]);

  // Live socket notification
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => setNotifications((prev) => [notif, ...prev]);
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  const markAsRead = async (id, linkURL) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (linkURL) navigate(linkURL);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'referral_request':
        return <Briefcase size={16} color="#3B82F6" />;
      case 'referral_accepted':
        return <CheckCircle size={16} color="#16A34A" />;
      case 'referral_rejected':
        return <Clock size={16} color="#EF4444" />;
      case 'message':
        return <MessageSquare size={16} color="#7C3AED" />;
      default:
        return <Bell size={16} color="#3B82F6" />;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '4rem' }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-main)',
          paddingTop: '2.5rem',
          paddingBottom: '2rem',
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #DBEAFE',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}
              >
                <Bell size={14} color="#3B82F6" />
                Notification Center
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Notifications & Alerts
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <CheckCheck size={16} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: filter === 'all' ? '#172554' : 'var(--bg-muted)',
                color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: filter === 'unread' ? '#172554' : 'var(--bg-muted)',
                color: filter === 'unread' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </section>

      {/* Main List */}
      <div className="container" style={{ maxWidth: '800px', paddingTop: '2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            type="bell"
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="You will receive alerts here when someone requests a referral, updates a status, or sends you a direct message."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayed.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id, n.linkURL)}
                className="card card-hover"
                style={{
                  padding: '1.125rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: n.isRead ? '#FFFFFF' : '#F8FAFC',
                  borderLeft: n.isRead ? '1px solid var(--border-main)' : '4px solid var(--primary-blue)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <UserAvatar user={n.sender} size="md" />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    {getNotificationIcon(n.type)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.90625rem', color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: n.isRead ? 400 : 600 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                {!n.isRead && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-blue)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

