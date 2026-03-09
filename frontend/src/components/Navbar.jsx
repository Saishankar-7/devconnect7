import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Fetch initial notifications
      const fetchNotifications = async () => {
        try {
          const { data } = await axios.get('/notifications');
          setNotifications(data);
        } catch (error) {
          console.error("Failed to load notifications", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // Simple ding notification sound could go here if requested
      };
      
      socket.on('newNotification', handleNewNotification);
      
      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = async (notifId, link) => {
    try {
      await axios.put(`/notifications/${notifId}/read`);
      setNotifications(notifications.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setShowDropdown(false);
      if (link) navigate(link);
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Dev<span>Connect</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/discover" className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>Discover</Link>
          {user && (
            <>
              <Link to="/chat" className={`nav-link ${location.pathname.startsWith('/chat') ? 'active' : ''}`}>Messages</Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            </>
          )}
        </div>
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Notification Bell */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown UI */}
                {showDropdown && (
                  <div className="glass-card" style={{ position: 'absolute', top: '150%', right: '-50px', width: '300px', padding: '0', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)' }}>
                      <h4 style={{ margin: 0 }}>Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Mark all read</button>
                      )}
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>No new notifications.</p>
                      ) : (
                        notifications.map((notif) => (
                           <div 
                             key={notif._id} 
                             onClick={() => markAsRead(notif._id, notif.linkURL)}
                             style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: notif.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.1)', transition: 'background-color 0.2s', display: 'flex', gap: '0.8rem' }}
                           >
                              {notif.sender?.avatarUrl ? (
                                <img src={notif.sender.avatarUrl} alt="Avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>
                                  {notif.sender?.name?.charAt(0) || '!'}
                                </div>
                              )}
                              <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: '1.4' }}>{notif.message}</p>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/profile" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
