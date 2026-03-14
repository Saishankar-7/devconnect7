import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import './Navbar.css';

/* ─── Helpers ────────────────────────────────────── */
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: '🏠', exact: true },
  { to: '/discover', label: 'Discover', icon: '🔍', exact: false },
  { to: '/chat', label: 'Messages', icon: '💬', exact: false, authOnly: true },
  { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: false, authOnly: true },
];

function isActive(pathname, to, exact) {
  return exact ? pathname === to : pathname.startsWith(to);
}

/* ─── Main Component ─────────────────────────────── */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);

  // ── Scroll state ────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile drawer on route change ─────────
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ── Lock body scroll when drawer is open ────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Fetch notifications ──────────────────────────
  useEffect(() => {
    if (!user || authLoading) return;
    axios.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => { });
  }, [user, authLoading]);

  // ── Socket: live notifications ───────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => setNotifications((prev) => [notif, ...prev]);
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  // ── Click outside → close dropdown ──────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = useCallback(() => {
    setMobileOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const markAsRead = useCallback(async (id, link) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setShowNotif(false);
      if (link) navigate(link);
    } catch { }
  }, [navigate]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visibleLinks = NAV_LINKS.filter((l) => !l.authOnly || user);

  if (authLoading) return null;

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-mark">⚡</span>
            Dev<span className="navbar__logo-accent">Connect</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar__links">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link${isActive(location.pathname, l.to, l.exact) ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="navbar__actions">
            {user ? (
              <>
                {/* Bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    className={`notif-trigger${unreadCount > 0 ? ' has-unread' : ''}`}
                    onClick={() => setShowNotif((v) => !v)}
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  >
                    <BellIcon />
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>

                  {showNotif && (
                    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                      <div className="notif-dropdown__head">
                        <span className="notif-dropdown__title">Notifications</span>
                        {unreadCount > 0 && (
                          <button className="notif-dropdown__mark-all" onClick={markAllAsRead}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="notif-dropdown__body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">
                            <div className="notif-empty__icon">🔔</div>
                            <p>You're all caught up!</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`notif-item${!n.isRead ? ' notif-item--unread' : ''}`}
                              onClick={() => markAsRead(n._id, n.linkURL)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && markAsRead(n._id, n.linkURL)}
                            >
                              {n.sender?.avatarUrl ? (
                                <img
                                  src={n.sender.avatarUrl}
                                  alt={n.sender.name}
                                  className="notif-item__avatar"
                                />
                              ) : (
                                <div className="notif-item__avatar-fallback">
                                  {n.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="notif-item__msg">{n.message}</p>
                                <span className="notif-item__time">{timeAgo(n.createdAt)}</span>
                              </div>
                              <div className={`notif-item__unread-dot${n.isRead ? ' notif-item__unread-dot--hidden' : ''}`} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User chip */}
                <Link to="/profile" className="user-chip">
                  <div className="user-chip__avatar">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="user-chip__name">{user.name}</span>
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} className="btn btn-ghost">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
                <Link to="/register" className="btn btn-primary">Sign up →</Link>
              </>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className={`hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className="hamburger__bar" />
              <span className="hamburger__bar" />
              <span className="hamburger__bar" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`mobile-drawer${mobileOpen ? ' open' : ''}`} role="dialog" aria-label="Navigation menu">
        {visibleLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`mobile-nav-link${isActive(location.pathname, l.to, l.exact) ? ' active' : ''}`}
          >
            <span className="mobile-nav-link__icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}

        <div className="mobile-drawer__divider" />

        <div className="mobile-drawer__actions">
          {user ? (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <span className="mobile-nav-link__icon">👤</span>
                {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up →</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
