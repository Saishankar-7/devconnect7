import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ─── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  icon: '⏳' },
  accepted: { label: 'Accepted', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   icon: '✅' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   icon: '❌' },
};

// ─── Stat card ────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div className="db-stat" style={{ '--stat-accent': accent }}>
    <span className="db-stat__value">{value}</span>
    <span className="db-stat__label">{label}</span>
  </div>
);

// ─── Skeleton referral row ────────────────────────────────────────
const SkeletonRow = () => (
  <div className="db-ref-card db-ref-card--skeleton">
    <div className="db-sk-block db-sk-block--title" />
    <div className="db-sk-block db-sk-block--sub" />
    <div className="db-sk-block db-sk-block--chip" />
  </div>
);

// ─── Referral card ────────────────────────────────────────────────
const ReferralCard = ({ referral, user, onUpdateStatus, updating }) => {
  const cfg        = STATUS_CONFIG[referral.status] || STATUS_CONFIG.pending;
  const isDev      = user.role === 'developer';
  const counterpart = isDev ? referral.referrer : referral.requester;
  const chatId      = counterpart?._id;

  return (
    <div className="db-ref-card">
      {/* Left */}
      <div className="db-ref-card__left">
        <div className="db-ref-card__avatar">
          {counterpart?.avatarUrl ? (
            <img src={counterpart.avatarUrl} alt={counterpart.name} className="db-ref-card__avatar-img" />
          ) : (
            <span>{counterpart?.name?.charAt(0).toUpperCase() ?? '?'}</span>
          )}
        </div>
        <div className="db-ref-card__info">
          <h4 className="db-ref-card__company">{referral.company}</h4>
          <p className="db-ref-card__person">
            {isDev ? 'Referrer' : 'Applicant'}:{' '}
            <strong>{counterpart?.name ?? '—'}</strong>
          </p>
          {referral.message && (
            <p className="db-ref-card__message">"{referral.message}"</p>
          )}
          {!isDev && (
            <div className="db-ref-card__links">
              {referral.requester?.resumeUrl && (
                <Link
                  to={`/resume?url=${encodeURIComponent(referral.requester.resumeUrl)}`}
                  className="db-ref-card__link"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Resume
                </Link>
              )}
              <Link to={`/profile/${referral.requester?._id}`} className="db-ref-card__link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="db-ref-card__right">
        <span
          className="db-ref-card__badge"
          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
        >
          {cfg.icon} {cfg.label}
        </span>

        <div className="db-ref-card__actions">
          {!isDev && referral.status === 'pending' && (
            <>
              <button
                className="db-ref-card__act-btn db-ref-card__act-btn--accept"
                onClick={() => onUpdateStatus(referral._id, 'accepted')}
                disabled={updating === referral._id}
              >
                {updating === referral._id ? '…' : 'Accept'}
              </button>
              <button
                className="db-ref-card__act-btn db-ref-card__act-btn--reject"
                onClick={() => onUpdateStatus(referral._id, 'rejected')}
                disabled={updating === referral._id}
              >
                {updating === referral._id ? '…' : 'Reject'}
              </button>
            </>
          )}
          {chatId && (
            <Link to={`/chat/${chatId}`} className="db-ref-card__chat-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate    = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [updating,  setUpdating]  = useState(null); // id of referral being updated
  const [activeTab, setActiveTab] = useState('all');

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/referrals/history');
      setReferrals(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load referrals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchReferrals();
  }, [authLoading, user, navigate, fetchReferrals]);

  if (authLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>Checking auth...</div>;
  if (!user) return null;

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.put(`/referrals/${id}/${status === 'accepted' ? 'accept' : 'reject'}`);
      setReferrals((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (!user) return null;

  // ── Derived counts
  const counts = {
    all:      referrals.length,
    pending:  referrals.filter((r) => r.status === 'pending').length,
    accepted: referrals.filter((r) => r.status === 'accepted').length,
    rejected: referrals.filter((r) => r.status === 'rejected').length,
  };

  const displayed = activeTab === 'all'
    ? referrals
    : referrals.filter((r) => r.status === activeTab);

  const TABS = ['all', 'pending', 'accepted', 'rejected'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .db-root {
          --db-bg:        #070c18;
          --db-surface:   #0f172a;
          --db-surface-2: #1e293b;
          --db-surface-3: #263548;
          --db-border:    rgba(99,179,237,0.1);
          --db-accent:    #38bdf8;
          --db-accent-2:  #818cf8;
          --db-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
          --db-glow:      rgba(56,189,248,0.1);
          --db-text-1:    #f1f5f9;
          --db-text-2:    #94a3b8;
          --db-text-3:    #64748b;
          --db-danger:    #ef4444;
          font-family: 'DM Sans', sans-serif;
          background: var(--db-bg);
          min-height: calc(100vh - 80px);
          padding: 3rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
          color: var(--db-text-2);
        }

        /* Ambient glows */
        .db-root::before {
          content: '';
          position: fixed;
          top: -200px; right: -100px;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .db-inner {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Top bar ── */
        .db-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .db-topbar__greeting {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--db-accent);
          margin: 0 0 6px;
        }

        .db-topbar__title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 800;
          color: var(--db-text-1);
          margin: 0;
          letter-spacing: -0.4px;
        }

        .db-topbar__title span {
          background: var(--db-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .db-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--db-surface);
          border: 1px solid var(--db-border);
          border-radius: 11px;
          padding: 10px 18px;
          color: var(--db-text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.18s ease;
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .db-edit-btn:hover {
          background: var(--db-surface-2);
          border-color: rgba(56,189,248,0.3);
          color: var(--db-text-1);
        }

        /* ── Profile card ── */
        .db-profile {
          background: var(--db-surface);
          border: 1px solid var(--db-border);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .db-profile::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(56,189,248,0.04), transparent 55%);
          pointer-events: none;
        }

        .db-profile__left { display: flex; align-items: center; gap: 1.25rem; }

        .db-profile__avatar {
          width: 68px; height: 68px;
          border-radius: 16px;
          object-fit: cover;
          border: 1.5px solid var(--db-border);
          flex-shrink: 0;
        }

        .db-profile__avatar-placeholder {
          width: 68px; height: 68px;
          border-radius: 16px;
          background: var(--db-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem; font-weight: 800;
          color: #fff; flex-shrink: 0;
        }

        .db-profile__name {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 700;
          color: var(--db-text-1);
          margin: 0 0 4px;
        }

        .db-profile__role {
          font-size: 0.85rem;
          color: var(--db-text-3);
          margin: 0;
          display: flex; align-items: center; gap: 5px;
        }

        .db-profile__role-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 100px;
        }

        .db-profile__role-badge--dev {
          background: rgba(129,140,248,0.1);
          border: 1px solid rgba(129,140,248,0.25);
          color: #818cf8;
        }

        .db-profile__role-badge--ref {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #22c55e;
        }

        /* ── Stats row ── */
        .db-stats {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .db-stat {
          background: var(--db-surface-2);
          border: 1px solid var(--db-border);
          border-radius: 14px;
          padding: 12px 18px;
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; min-width: 72px;
          position: relative; overflow: hidden;
        }

        .db-stat::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--stat-accent, var(--db-accent));
          opacity: 0.6;
        }

        .db-stat__value {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem; font-weight: 800;
          color: var(--stat-accent, var(--db-text-1));
          line-height: 1;
        }

        .db-stat__label {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--db-text-3);
        }

        /* ── Section header ── */
        .db-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 12px;
        }

        .db-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: var(--db-text-1);
          margin: 0;
        }

        /* ── Tabs ── */
        .db-tabs {
          display: flex;
          gap: 4px;
          background: var(--db-surface);
          border: 1px solid var(--db-border);
          border-radius: 12px;
          padding: 4px;
        }

        .db-tab {
          border: none; border-radius: 9px;
          padding: 6px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.18s ease;
          background: transparent;
          color: var(--db-text-3);
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }

        .db-tab__count {
          background: var(--db-surface-2);
          border-radius: 100px;
          padding: 1px 6px;
          font-size: 0.67rem;
          min-width: 18px; text-align: center;
        }

        .db-tab--active {
          background: var(--db-gradient);
          color: #fff;
          box-shadow: 0 2px 10px rgba(56,189,248,0.2);
        }

        .db-tab--active .db-tab__count { background: rgba(255,255,255,0.25); }
        .db-tab:hover:not(.db-tab--active) { background: var(--db-surface-2); color: var(--db-text-2); }

        /* ── Error ── */
        .db-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: var(--db-danger);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.875rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; margin-bottom: 1.5rem;
        }

        .db-error__retry {
          background: rgba(239,68,68,0.12);
          border: none; border-radius: 7px;
          padding: 5px 12px;
          color: var(--db-danger);
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: background 0.15s;
        }

        .db-error__retry:hover { background: rgba(239,68,68,0.22); }

        /* ── Referral cards ── */
        .db-ref-list { display: flex; flex-direction: column; gap: 10px; }

        .db-ref-card {
          background: var(--db-surface);
          border: 1px solid var(--db-border);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          transition: border-color 0.18s, box-shadow 0.18s;
          animation: dbFadeIn 0.2s ease forwards;
        }

        @keyframes dbFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .db-ref-card:hover {
          border-color: rgba(56,189,248,0.2);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }

        .db-ref-card__left { display: flex; gap: 12px; align-items: flex-start; }

        .db-ref-card__avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: var(--db-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 800;
          color: #fff; flex-shrink: 0; overflow: hidden;
        }

        .db-ref-card__avatar-img {
          width: 44px; height: 44px;
          object-fit: cover; border-radius: 12px;
        }

        .db-ref-card__company {
          font-family: 'Syne', sans-serif;
          font-size: 0.975rem; font-weight: 700;
          color: var(--db-text-1); margin: 0 0 4px;
        }

        .db-ref-card__person {
          font-size: 0.825rem; color: var(--db-text-3); margin: 0 0 6px;
        }

        .db-ref-card__person strong { color: var(--db-text-2); font-weight: 600; }

        .db-ref-card__message {
          font-size: 0.8rem; color: var(--db-text-3);
          font-style: italic; margin: 0 0 8px;
          max-width: 420px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .db-ref-card__links { display: flex; gap: 12px; }

        .db-ref-card__link {
          font-size: 0.78rem; font-weight: 500;
          color: var(--db-accent);
          text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: opacity 0.15s;
        }

        .db-ref-card__link:hover { opacity: 0.75; }

        .db-ref-card__right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 10px;
          flex-shrink: 0;
        }

        .db-ref-card__badge {
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 11px; border-radius: 100px;
          border: 1px solid; white-space: nowrap;
        }

        .db-ref-card__actions { display: flex; gap: 6px; align-items: center; }

        .db-ref-card__act-btn {
          border-radius: 9px;
          padding: 6px 13px;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          cursor: pointer; border: 1px solid;
          transition: all 0.15s;
        }

        .db-ref-card__act-btn--accept {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.3);
          color: #22c55e;
        }

        .db-ref-card__act-btn--accept:hover:not(:disabled) {
          background: rgba(34,197,94,0.2);
        }

        .db-ref-card__act-btn--reject {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25);
          color: #ef4444;
        }

        .db-ref-card__act-btn--reject:hover:not(:disabled) {
          background: rgba(239,68,68,0.18);
        }

        .db-ref-card__act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .db-ref-card__chat-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--db-surface-2);
          border: 1px solid var(--db-border);
          border-radius: 9px;
          padding: 6px 13px;
          color: var(--db-text-2);
          font-size: 0.8rem; font-weight: 500;
          text-decoration: none;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .db-ref-card__chat-btn:hover {
          background: var(--db-glow);
          border-color: rgba(56,189,248,0.3);
          color: var(--db-accent);
        }

        /* ── Skeleton ── */
        .db-ref-card--skeleton {
          pointer-events: none;
          display: flex; flex-direction: column; gap: 10px;
        }

        .db-sk-block {
          border-radius: 8px;
          background: var(--db-surface-2);
          animation: dbShimmer 1.4s ease-in-out infinite;
        }

        .db-sk-block--title { height: 14px; width: 40%; }
        .db-sk-block--sub   { height: 11px; width: 55%; }
        .db-sk-block--chip  { height: 22px; width: 80px; border-radius: 100px; }

        @keyframes dbShimmer { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* ── Empty state ── */
        .db-empty {
          background: var(--db-surface);
          border: 1px solid var(--db-border);
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }

        .db-empty__icon { font-size: 2.5rem; }

        .db-empty__title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: var(--db-text-1); margin: 0;
        }

        .db-empty__sub {
          font-size: 0.875rem; color: var(--db-text-3);
          max-width: 340px; line-height: 1.6; margin: 0;
        }

        .db-empty__cta {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--db-gradient);
          border: none; border-radius: 12px;
          padding: 11px 22px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          text-decoration: none; margin-top: 6px;
          transition: opacity 0.2s, transform 0.2s;
        }

        .db-empty__cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .db-root { padding: 2rem 1rem 3rem; }
          .db-profile { flex-direction: column; align-items: flex-start; }
          .db-stats { width: 100%; justify-content: stretch; }
          .db-stat  { flex: 1; }
          .db-ref-card { flex-direction: column; }
          .db-ref-card__right { flex-direction: row; flex-wrap: wrap; align-items: center; width: 100%; justify-content: flex-start; }
        }

        @media (max-width: 480px) {
          .db-tabs { flex-wrap: wrap; }
          .db-tab  { flex: 1; justify-content: center; }
        }
      `}</style>

      <div className="db-root">
        <div className="db-inner">

          {/* ── Top bar ── */}
          <div className="db-topbar">
            <div>
              <p className="db-topbar__greeting">Welcome back</p>
              <h1 className="db-topbar__title">
                {user.name.split(' ')[0]}'s <span>Dashboard</span>
              </h1>
            </div>
            <Link to="/profile" className="db-edit-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </Link>
          </div>

          {/* ── Profile card ── */}
          <div className="db-profile">
            <div className="db-profile__left">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="db-profile__avatar" />
              ) : (
                <div className="db-profile__avatar-placeholder" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="db-profile__name">{user.name}</h2>
                <p className="db-profile__role">
                  <span className={`db-profile__role-badge ${user.role === 'developer' ? 'db-profile__role-badge--dev' : 'db-profile__role-badge--ref'}`}>
                    {user.role === 'developer' ? '💻 Job Seeker' : '🏢 Referrer'}
                  </span>
                  {user.company && (
                    <span style={{ marginLeft: 6, color: 'var(--db-accent)', fontSize: '0.85rem' }}>
                      @ {user.company}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="db-stats">
              <StatCard label="Total"    value={counts.all}      accent="var(--db-accent)"  />
              <StatCard label="Pending"  value={counts.pending}  accent="#f59e0b" />
              <StatCard label="Accepted" value={counts.accepted} accent="#22c55e" />
              <StatCard label="Rejected" value={counts.rejected} accent="#ef4444" />
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="db-error" role="alert">
              <span>⚠️ {error}</span>
              <button className="db-error__retry" onClick={fetchReferrals}>Retry</button>
            </div>
          )}

          {/* ── Referrals section ── */}
          <div className="db-section-head">
            <h2 className="db-section-title">Referral Requests</h2>

            {referrals.length > 0 && (
              <div className="db-tabs" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={activeTab === t}
                    className={`db-tab ${activeTab === t ? 'db-tab--active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    <span className="db-tab__count">{counts[t]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="db-ref-list">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : referrals.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty__icon">
                {user.role === 'developer' ? '🔍' : '📬'}
              </div>
              <h3 className="db-empty__title">No referral requests yet</h3>
              <p className="db-empty__sub">
                {user.role === 'developer'
                  ? 'Browse referrers at top tech companies and send your first request.'
                  : 'Developers will send you referral requests to review here.'}
              </p>
              {user.role === 'developer' && (
                <Link to="/discover" className="db-empty__cta">
                  Find Referrers →
                </Link>
              )}
            </div>
          ) : displayed.length === 0 ? (
            <div className="db-empty" style={{ padding: '2.5rem' }}>
              <p className="db-empty__sub">No {activeTab} requests.</p>
            </div>
          ) : (
            <div className="db-ref-list">
              {displayed.map((refData) => (
                <ReferralCard
                  key={refData._id}
                  referral={refData}
                  user={user}
                  onUpdateStatus={updateStatus}
                  updating={updating}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;
