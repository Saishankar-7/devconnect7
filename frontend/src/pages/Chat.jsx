import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/ChatBox';

// ─── Skeleton contact row ─────────────────────────────────────────
const SkeletonContact = () => (
  <div className="ch-contact ch-contact--skeleton">
    <div className="ch-contact__sk-avatar" />
    <div className="ch-contact__sk-info">
      <div className="ch-contact__sk-line ch-contact__sk-line--name" />
      <div className="ch-contact__sk-line ch-contact__sk-line--sub" />
    </div>
  </div>
);

// ─── Empty contacts state ─────────────────────────────────────────
const EmptyContacts = ({ search }) => (
  <div className="ch-empty">
    <span className="ch-empty__icon">💬</span>
    <p className="ch-empty__text">
      {search ? `No contacts matching "${search}"` : 'No contacts yet.'}
    </p>
  </div>
);

// ─── No conversation selected ─────────────────────────────────────
const NoConversation = () => (
  <div className="ch-no-conv">
    <div className="ch-no-conv__icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <h3 className="ch-no-conv__title">Your messages</h3>
    <p className="ch-no-conv__desc">
      Select a contact from the left to start or continue a conversation.
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────
const Chat = () => {
  const { user, loading: authLoading }    = useContext(AuthContext);
  const navigate    = useNavigate();
  const { userId }  = useParams();

  const [usersList,  setUsersList]  = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/users');
      const others = data.filter((u) => u._id !== user._id);
      setUsersList(others);
      if (userId) {
        const selected = others.find((u) => u._id === userId);
        if (selected) setActiveUser(selected);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Could not load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchContacts();
  }, [authLoading, fetchContacts, user, navigate]);

  if (authLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>Loading chat...</div>;
  if (!user) return null;

  const handleSelectUser = (u) => {
    setActiveUser(u);
    setSidebarOpen(false);
    navigate(`/chat/${u._id}`, { replace: true });
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .ch-root {
          --ch-bg:        #070c18;
          --ch-surface:   #0f172a;
          --ch-surface-2: #1e293b;
          --ch-surface-3: #263548;
          --ch-border:    rgba(99,179,237,0.1);
          --ch-accent:    #38bdf8;
          --ch-accent-2:  #818cf8;
          --ch-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
          --ch-glow:      rgba(56,189,248,0.1);
          --ch-text-1:    #f1f5f9;
          --ch-text-2:    #94a3b8;
          --ch-text-3:    #64748b;
          --ch-active:    rgba(56,189,248,0.08);
          --ch-danger:    #ef4444;
          font-family: 'DM Sans', sans-serif;
          background: var(--ch-bg);
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          padding: 0 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* ambient glow */
        .ch-root::before {
          content: '';
          position: fixed;
          top: -200px; right: -100px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Shell ── */
        .ch-shell {
          flex: 1;
          display: flex;
          margin: 1rem 0;
          background: var(--ch-surface);
          border: 1px solid var(--ch-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          position: relative;
          z-index: 1;
        }

        /* ── Sidebar ── */
        .ch-sidebar {
          width: 300px;
          flex-shrink: 0;
          border-right: 1px solid var(--ch-border);
          display: flex;
          flex-direction: column;
          background: var(--ch-surface);
          transition: transform 0.28s ease;
        }

        /* ── Sidebar header ── */
        .ch-sidebar__head {
          padding: 1.25rem 1.25rem 1rem;
          border-bottom: 1px solid var(--ch-border);
          flex-shrink: 0;
        }

        .ch-sidebar__title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--ch-text-1);
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ch-sidebar__count {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--ch-accent);
          background: var(--ch-glow);
          border: 1px solid rgba(56,189,248,0.2);
          padding: 2px 9px;
          border-radius: 100px;
        }

        /* Search box */
        .ch-search-wrap {
          position: relative;
        }

        .ch-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ch-text-3);
          pointer-events: none;
          display: flex;
        }

        .ch-search-input {
          width: 100%;
          background: var(--ch-surface-2);
          border: 1.5px solid var(--ch-border);
          border-radius: 10px;
          padding: 9px 34px;
          color: var(--ch-text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ch-search-input::placeholder { color: var(--ch-text-3); }
        .ch-search-input:focus {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 0 0 3px var(--ch-glow);
        }

        .ch-search-clear {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--ch-surface-3);
          border: none;
          border-radius: 5px;
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--ch-text-3);
          transition: all 0.15s;
          padding: 0;
        }

        .ch-search-clear:hover { background: var(--ch-border); color: var(--ch-text-2); }

        /* ── Contact list ── */
        .ch-contact-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--ch-surface-2) transparent;
        }

        .ch-contact-list::-webkit-scrollbar { width: 4px; }
        .ch-contact-list::-webkit-scrollbar-thumb { background: var(--ch-surface-2); border-radius: 4px; }

        /* ── Contact row ── */
        .ch-contact {
          padding: 12px 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.15s ease;
          position: relative;
        }

        .ch-contact:hover { background: rgba(255,255,255,0.025); }

        .ch-contact--active {
          background: var(--ch-active) !important;
        }

        .ch-contact--active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--ch-gradient);
        }

        .ch-contact__avatar {
          width: 42px; height: 42px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid var(--ch-border);
        }

        .ch-contact__avatar-placeholder {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: var(--ch-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .ch-contact__info { flex: 1; min-width: 0; }

        .ch-contact__name {
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--ch-text-1);
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ch-contact--active .ch-contact__name { color: var(--ch-accent); }

        .ch-contact__sub {
          font-size: 0.775rem;
          color: var(--ch-text-3);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ch-contact__role-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ch-contact__role-dot--referrer { background: #22c55e; }
        .ch-contact__role-dot--seeker   { background: #a78bfa; }

        /* ── Skeleton ── */
        .ch-contact--skeleton { cursor: default; pointer-events: none; }

        .ch-contact__sk-avatar {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: var(--ch-surface-2);
          flex-shrink: 0;
          animation: chShimmer 1.4s ease-in-out infinite;
        }

        .ch-contact__sk-info { flex: 1; display: flex; flex-direction: column; gap: 7px; }

        .ch-contact__sk-line {
          height: 10px;
          border-radius: 5px;
          background: var(--ch-surface-2);
          animation: chShimmer 1.4s ease-in-out infinite;
        }

        .ch-contact__sk-line--name { width: 65%; }
        .ch-contact__sk-line--sub  { width: 40%; }

        @keyframes chShimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }

        /* ── Error ── */
        .ch-error {
          margin: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: var(--ch-danger);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .ch-error__retry {
          background: rgba(239,68,68,0.12);
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          color: var(--ch-danger);
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .ch-error__retry:hover { background: rgba(239,68,68,0.22); }

        /* ── Empty ── */
        .ch-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          text-align: center;
          gap: 8px;
        }

        .ch-empty__icon { font-size: 2rem; opacity: 0.5; }

        .ch-empty__text {
          font-size: 0.85rem;
          color: var(--ch-text-3);
          line-height: 1.5;
          margin: 0;
        }

        /* ── Main panel ── */
        .ch-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--ch-bg);
          min-width: 0;
        }

        /* No conversation */
        .ch-no-conv {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          gap: 12px;
        }

        .ch-no-conv__icon {
          width: 72px; height: 72px;
          border-radius: 18px;
          background: var(--ch-surface-2);
          border: 1px solid var(--ch-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--ch-text-3);
          margin-bottom: 4px;
        }

        .ch-no-conv__title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ch-text-1);
          margin: 0;
        }

        .ch-no-conv__desc {
          font-size: 0.875rem;
          color: var(--ch-text-3);
          max-width: 300px;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Mobile hamburger ── */
        .ch-mob-bar {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 12px 0 0;
          position: relative;
          z-index: 1;
        }

        .ch-mob-toggle {
          background: var(--ch-surface);
          border: 1px solid var(--ch-border);
          border-radius: 10px;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--ch-text-2);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .ch-mob-toggle:hover { background: var(--ch-surface-2); color: var(--ch-text-1); }

        .ch-mob-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--ch-text-1);
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ch-root { padding: 0 1rem; }

          .ch-mob-bar { display: flex; }

          .ch-sidebar {
            position: absolute;
            inset: 0;
            width: 100%;
            z-index: 10;
            transform: translateX(-100%);
            border-radius: 0;
          }

          .ch-sidebar--open { transform: translateX(0); }

          .ch-shell { border-radius: 16px; }
        }

        @media (max-width: 480px) {
          .ch-root { padding: 0 0.75rem; }
        }
      `}</style>

      <div className="ch-root">

        {/* Mobile top bar */}
        <div className="ch-mob-bar">
          <button
            className="ch-mob-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle contacts"
          >
            {sidebarOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </button>
          <h2 className="ch-mob-title">
            {activeUser ? activeUser.name : 'Messages'}
          </h2>
        </div>

        <div className="ch-shell">

          {/* ── Sidebar ── */}
          <aside className={`ch-sidebar ${sidebarOpen ? 'ch-sidebar--open' : ''}`}>

            <div className="ch-sidebar__head">
              <div className="ch-sidebar__title">
                Conversations
                {!loading && (
                  <span className="ch-sidebar__count">{filteredUsers.length}</span>
                )}
              </div>
              <div className="ch-search-wrap">
                <span className="ch-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search contacts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ch-search-input"
                  aria-label="Search contacts"
                />
                {search && (
                  <button
                    className="ch-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="ch-error" role="alert">
                <span>{error}</span>
                <button className="ch-error__retry" onClick={fetchContacts}>Retry</button>
              </div>
            )}

            {/* Contact list */}
            <div className="ch-contact-list">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonContact key={i} />)
              ) : filteredUsers.length === 0 ? (
                <EmptyContacts search={search} />
              ) : (
                filteredUsers.map((u) => {
                  const isActive   = activeUser?._id === u._id;
                  const isReferrer = u.role === 'employee';
                  return (
                    <div
                      key={u._id}
                      className={`ch-contact ${isActive ? 'ch-contact--active' : ''}`}
                      onClick={() => handleSelectUser(u)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectUser(u)}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="ch-contact__avatar" />
                      ) : (
                        <div className="ch-contact__avatar-placeholder" aria-hidden="true">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ch-contact__info">
                        <h4 className="ch-contact__name">{u.name}</h4>
                        <p className="ch-contact__sub">
                          <span className={`ch-contact__role-dot ${isReferrer ? 'ch-contact__role-dot--referrer' : 'ch-contact__role-dot--seeker'}`} />
                          {isReferrer ? u.company : 'Job Seeker'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Main panel ── */}
          <main className="ch-main">
            {activeUser ? (
              <ChatBox activeUser={activeUser} />
            ) : (
              <NoConversation />
            )}
          </main>

        </div>
      </div>
    </>
  );
};

export default Chat;
