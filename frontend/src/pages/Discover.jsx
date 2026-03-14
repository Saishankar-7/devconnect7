import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';

// ─── Debounce hook ───────────────────────────────────────────────
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── Skeleton card ───────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="dc-disc__skeleton">
    <div className="dc-disc__sk-avatar" />
    <div className="dc-disc__sk-line dc-disc__sk-line--wide" />
    <div className="dc-disc__sk-line dc-disc__sk-line--mid" />
    <div className="dc-disc__sk-chips">
      <div className="dc-disc__sk-chip" />
      <div className="dc-disc__sk-chip" />
      <div className="dc-disc__sk-chip" />
    </div>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────
const EmptyState = ({ query, type }) => (
  <div className="dc-disc__empty">
    <div className="dc-disc__empty-icon">🔍</div>
    <h3 className="dc-disc__empty-title">No results found</h3>
    <p className="dc-disc__empty-desc">
      No users matched{' '}
      <strong>"{query}"</strong> in{' '}
      <strong>{type === 'company' ? 'companies' : 'skills'}</strong>.
      <br />Try a different keyword or switch search type.
    </p>
  </div>
);

// ─── Main component ──────────────────────────────────────────────
const Discover = () => {
  const [users, setUsers]               = useState([]);
  const [searchInput, setSearchInput]   = useState('');
  const [searchType, setSearchType]     = useState('company');
  const [loading, setLoading]           = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [error, setError]               = useState(null);

  const searchParam = useDebounce(searchInput, 400);
  const inputRef    = useRef(null);

  const { user, loading: authLoading }  = useContext(AuthContext);
  const navigate  = useNavigate();

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data: usersData } = await axios.get(`/users/discover?keyword=${searchParam}`);

      let filtered = usersData;
      if (searchType === 'skills' && searchParam) {
        filtered = usersData.filter(
          (u) => u.skills?.some((s) => s.toLowerCase().includes(searchParam.toLowerCase()))
        );
      }

      setUsers(filtered);
      setTotalCount(filtered.length);

      if (user.role === 'developer') {
        const { data: referralsData } = await axios.get('/referrals/history');
        setSentRequests(referralsData.map((ref) => ref.referrer._id || ref.referrer));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParam, searchType, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchUsers();
  }, [authLoading, fetchUsers, user, navigate]);

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchInput('');
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setSearchInput('');
    inputRef.current?.focus();
  };

  if (authLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>Finding experts...</div>;
  if (!user) return null;

  const placeholders = {
    company: 'Search by company (Google, Meta…)',
    skills:  'Search by skill (React, Python, Go…)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .dc-disc {
          --d-bg:         #070c18;
          --d-surface:    #0f172a;
          --d-surface-2:  #1e293b;
          --d-border:     rgba(99,179,237,0.1);
          --d-accent:     #38bdf8;
          --d-accent-2:   #818cf8;
          --d-gradient:   linear-gradient(135deg,#38bdf8,#818cf8);
          --d-glow:       rgba(56,189,248,0.1);
          --d-text-1:     #f1f5f9;
          --d-text-2:     #94a3b8;
          --d-text-3:     #64748b;
          --d-danger:     #ef4444;
          --d-danger-bg:  rgba(239,68,68,0.08);
          font-family: 'DM Sans', sans-serif;
          background: var(--d-bg);
          min-height: calc(100vh - 140px);
          padding: 3.5rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
          color: var(--d-text-2);
        }

        /* Ambient glows */
        .dc-disc__glow-a, .dc-disc__glow-b {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .dc-disc__glow-a {
          width: 560px; height: 560px;
          top: -180px; right: -100px;
          background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
        }
        .dc-disc__glow-b {
          width: 480px; height: 480px;
          bottom: -150px; left: -80px;
          background: radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%);
        }

        .dc-disc__inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Hero ── */
        .dc-disc__hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dc-disc__hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--d-accent);
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.2);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 1.25rem;
        }

        .dc-disc__hero-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--d-accent);
          box-shadow: 0 0 8px var(--d-accent);
          animation: discPulse 2s ease-in-out infinite;
        }

        @keyframes discPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.7); }
        }

        .dc-disc__hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.9rem, 4vw, 2.8rem);
          font-weight: 800;
          color: var(--d-text-1);
          margin: 0 0 0.9rem;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .dc-disc__hero-title span {
          background: var(--d-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dc-disc__hero-desc {
          font-size: 1rem;
          color: var(--d-text-3);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Search box ── */
        .dc-disc__search-wrap {
          max-width: 680px;
          margin: 0 auto 2rem;
        }

        .dc-disc__search-box {
          background: var(--d-surface);
          border: 1.5px solid var(--d-border);
          border-radius: 16px;
          padding: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .dc-disc__search-box:focus-within {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 0 0 4px rgba(56,189,248,0.07);
        }

        /* Type toggle pills */
        .dc-disc__type-toggle {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
          padding: 2px;
        }

        .dc-disc__type-btn {
          border: none;
          border-radius: 10px;
          padding: 8px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 0.775rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.18s ease;
          background: transparent;
          color: var(--d-text-3);
          white-space: nowrap;
        }

        .dc-disc__type-btn--active {
          background: var(--d-gradient);
          color: #fff;
          box-shadow: 0 2px 12px rgba(56,189,248,0.2);
        }

        .dc-disc__type-btn:hover:not(.dc-disc__type-btn--active) {
          background: var(--d-surface-2);
          color: var(--d-text-2);
        }

        /* Divider */
        .dc-disc__search-sep {
          width: 1px;
          height: 22px;
          background: var(--d-border);
          flex-shrink: 0;
        }

        /* Input */
        .dc-disc__search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--d-text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          padding: 8px 6px;
          min-width: 0;
        }

        .dc-disc__search-input::placeholder { color: var(--d-text-3); }

        /* Search icon + clear btn */
        .dc-disc__search-icon {
          color: var(--d-text-3);
          flex-shrink: 0;
          padding: 0 4px;
          display: flex;
        }

        .dc-disc__clear-btn {
          background: var(--d-surface-2);
          border: none;
          border-radius: 8px;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--d-text-3);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .dc-disc__clear-btn:hover { background: var(--d-border); color: var(--d-text-2); }

        /* Results meta */
        .dc-disc__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 2px;
          min-height: 24px;
        }

        .dc-disc__meta-count {
          font-size: 0.82rem;
          color: var(--d-text-3);
        }

        .dc-disc__meta-count strong {
          color: var(--d-accent);
          font-weight: 600;
        }

        .dc-disc__meta-kbd {
          font-size: 0.72rem;
          color: var(--d-text-3);
          background: var(--d-surface);
          border: 1px solid var(--d-border);
          border-radius: 5px;
          padding: 2px 7px;
          letter-spacing: 0.02em;
        }

        /* ── Grid ── */
        .dc-disc__grid {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* ── Skeleton ── */
        .dc-disc__skeleton {
          background: var(--d-surface);
          border: 1px solid var(--d-border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dc-disc__sk-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: var(--d-surface-2);
          animation: dcShimmer 1.4s ease-in-out infinite;
        }

        .dc-disc__sk-line {
          height: 12px;
          border-radius: 6px;
          background: var(--d-surface-2);
          animation: dcShimmer 1.4s ease-in-out infinite;
        }

        .dc-disc__sk-line--wide { width: 70%; }
        .dc-disc__sk-line--mid  { width: 45%; }

        .dc-disc__sk-chips {
          display: flex; gap: 8px; margin-top: 4px;
        }

        .dc-disc__sk-chip {
          height: 24px; width: 60px;
          border-radius: 100px;
          background: var(--d-surface-2);
          animation: dcShimmer 1.4s ease-in-out infinite;
        }

        @keyframes dcShimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }

        /* ── Empty state ── */
        .dc-disc__empty {
          text-align: center;
          padding: 5rem 1rem;
          grid-column: 1 / -1;
        }

        .dc-disc__empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: grayscale(0.3);
        }

        .dc-disc__empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--d-text-1);
          margin: 0 0 0.6rem;
        }

        .dc-disc__empty-desc {
          font-size: 0.9rem;
          color: var(--d-text-3);
          line-height: 1.7;
          max-width: 360px;
          margin: 0 auto;
        }

        .dc-disc__empty-desc strong { color: var(--d-text-2); }

        /* ── Error ── */
        .dc-disc__error {
          background: var(--d-danger-bg);
          border: 1px solid rgba(239,68,68,0.2);
          color: var(--d-danger);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }

        .dc-disc__error-retry {
          background: rgba(239,68,68,0.15);
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          color: var(--d-danger);
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .dc-disc__error-retry:hover { background: rgba(239,68,68,0.25); }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .dc-disc { padding: 2.5rem 1rem 3rem; }

          .dc-disc__search-box {
            flex-wrap: wrap;
            border-radius: 14px;
          }

          .dc-disc__type-toggle {
            width: 100%;
            justify-content: stretch;
          }

          .dc-disc__type-btn { flex: 1; text-align: center; }

          .dc-disc__search-sep { display: none; }

          .dc-disc__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dc-disc">
        <div className="dc-disc__glow-a" aria-hidden="true" />
        <div className="dc-disc__glow-b" aria-hidden="true" />

        <div className="dc-disc__inner">

          {/* Hero */}
          <div className="dc-disc__hero">
            <div className="dc-disc__hero-tag">
              <span className="dc-disc__hero-dot" />
              {user.role === 'developer' ? 'Find Your Referrer' : 'Discover Developers'}
            </div>
            <h1 className="dc-disc__hero-title">
              {user.role === 'developer' ? (
                <>Discover <span>Tech Referrers</span></>
              ) : (
                <>Explore <span>Developer Talent</span></>
              )}
            </h1>
            <p className="dc-disc__hero-desc">
              {user.role === 'developer'
                ? 'Find employees at top tech companies who can refer you to your dream job.'
                : 'Browse talented developers looking for referrals. Search by skills or company interest.'}
            </p>
          </div>

          {/* Search */}
          <div className="dc-disc__search-wrap">
            <div className="dc-disc__search-box">
              <div className="dc-disc__type-toggle">
                {['company', 'skills'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`dc-disc__type-btn ${searchType === t ? 'dc-disc__type-btn--active' : ''}`}
                    onClick={() => handleTypeChange(t)}
                  >
                    {t === 'company' ? '🏢 Company' : '⚡ Skills'}
                  </button>
                ))}
              </div>

              <div className="dc-disc__search-sep" />

              <span className="dc-disc__search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>

              <input
                ref={inputRef}
                type="text"
                className="dc-disc__search-input"
                placeholder={placeholders[searchType]}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={`Search by ${searchType}`}
              />

              {searchInput && (
                <button
                  type="button"
                  className="dc-disc__clear-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Meta row */}
            <div className="dc-disc__meta">
              {!loading && !error && (
                <span className="dc-disc__meta-count">
                  <strong>{totalCount}</strong> {totalCount === 1 ? 'result' : 'results'} found
                </span>
              )}
              <span className="dc-disc__meta-kbd">⌘ K to focus</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="dc-disc__error" role="alert">
              <span>⚠️ {error}</span>
              <button className="dc-disc__error-retry" onClick={fetchUsers}>Retry</button>
            </div>
          )}

          {/* Grid */}
          <div className="dc-disc__grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : users.length === 0 ? (
              <EmptyState query={searchInput} type={searchType} />
            ) : (
              users.map((u) => (
                <UserCard
                  key={u._id}
                  employee={u}
                  hasRequested={sentRequests.includes(u._id)}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Discover;
