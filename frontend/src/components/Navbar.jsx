import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Logo from './ui/Logo';
import UserAvatar from './ui/UserAvatar';
import {
  Compass,
  Users,
  Briefcase,
  MessageSquare,
  LayoutDashboard,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import './Navbar.css';

function timeAgo(date) {
  if (!date) return '';
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawers/menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowNotif(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Fetch notifications
  useEffect(() => {
    if (!user || authLoading) return;
    axios.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
  }, [user, authLoading]);

  // Live Socket notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => setNotifications((prev) => [notif, ...prev]);
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = useCallback(() => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const markAsRead = useCallback(async (id, link) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setShowNotif(false);
      if (link) navigate(link);
    } catch {}
  }, [navigate]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { to: '/discover', label: 'Discover', icon: Compass, exact: false, authOnly: true },
    { to: '/network', label: 'Network', icon: Users, exact: false, authOnly: true },
    { to: '/referrals', label: 'Referrals', icon: Briefcase, exact: false, authOnly: true },
    { to: '/chat', label: 'Messages', icon: MessageSquare, exact: false, authOnly: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: false, authOnly: true },
  ];

  const visibleLinks = navLinks.filter((l) => !l.authOnly || user);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="navbar__links">
            {visibleLinks.map((l) => {
              const Icon = l.icon;
              const isActive = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="navbar__actions">
            {user ? (
              <>
                {/* Notification Dropdown Trigger */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    className={`notif-trigger ${showNotif ? 'active' : ''}`}
                    onClick={() => setShowNotif((v) => !v)}
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  >
                    <Bell size={19} />
                    {unreadCount > 0 && (
                      <span className="notif-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotif && (
                    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                      <div className="notif-dropdown__head">
                        <span className="notif-dropdown__title">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            className="notif-dropdown__mark-all"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notif-dropdown__body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">
                            <Clock size={28} style={{ margin: '0 auto 8px', color: '#94A3B8' }} />
                            <p>You are all caught up!</p>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n._id}
                              className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                              onClick={() => markAsRead(n._id, n.linkURL)}
                            >
                              <UserAvatar
                                user={n.sender}
                                name={n.sender?.name}
                                avatarUrl={n.sender?.avatarUrl}
                                size="sm"
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="notif-item__msg">{n.message}</p>
                                <span className="notif-item__time">{timeAgo(n.createdAt)}</span>
                              </div>
                              {!n.isRead && (
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary-blue)',
                                    flexShrink: 0,
                                    marginTop: '4px',
                                  }}
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div
                        style={{
                          padding: '8px 12px',
                          borderTop: '1px solid var(--border-main)',
                          backgroundColor: 'var(--bg-subtle)',
                          textAlign: 'center',
                        }}
                      >
                        <Link
                          to="/notifications"
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--primary-blue)',
                            fontWeight: 600,
                          }}
                          onClick={() => setShowNotif(false)}
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Trigger */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    className="user-menu-btn"
                    onClick={() => setShowUserMenu((v) => !v)}
                    aria-label="User profile menu"
                  >
                    <UserAvatar user={user} size="xs" />
                    <span className="user-menu-name">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="user-dropdown__header">
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {user.email}
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            marginTop: '6px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: user.role === 'employee' ? '#15803D' : '#1D4ED8',
                            backgroundColor: user.role === 'employee' ? '#F0FDF4' : '#EFF6FF',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            border: `1px solid ${user.role === 'employee' ? '#BBF7D0' : '#DBEAFE'}`,
                          }}
                        >
                          {user.role === 'employee' ? `Referrer @ ${user.company || 'Tech'}` : 'Developer / Job Seeker'}
                        </div>
                      </div>

                      <Link to="/profile" className="user-dropdown__item">
                        <User size={15} />
                        <span>My Profile</span>
                      </Link>
                      <Link to="/referrals" className="user-dropdown__item">
                        <Briefcase size={15} />
                        <span>Referral Tracker</span>
                      </Link>
                      <Link to="/settings" className="user-dropdown__item">
                        <Settings size={15} />
                        <span>Account Settings</span>
                      </Link>

                      <div style={{ height: '1px', backgroundColor: 'var(--border-main)', margin: '4px 0' }} />

                      <button
                        onClick={handleLogout}
                        className="user-dropdown__item user-dropdown__item--danger"
                        style={{ width: '100%', background: 'none', border: 'none' }}
                      >
                        <LogOut size={15} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started →
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Logo size="sm" />
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-main)',
              marginBottom: '1.5rem',
            }}
          >
            <UserAvatar user={user} size="sm" showRoleDot={true} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.role === 'employee' ? `Referrer @ ${user.company}` : 'Job Seeker'}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {visibleLinks.map((l) => {
            const Icon = l.icon;
            const isActive = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{l.label}</span>
              </Link>
            );
          })}

          {user && (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <User size={18} />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="mobile-nav-link">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '1rem', marginTop: 'auto' }}>
          {user ? (
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{ width: '100%' }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Create Account →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
