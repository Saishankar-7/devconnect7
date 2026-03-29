import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// ─── Skeleton loader ──────────────────────────────────────────────
const SkeletonProfile = () => (
  <div className="up-skeleton">
    <div className="up-sk-banner" />
    <div className="up-sk-body">
      <div className="up-sk-avatar" />
      <div className="up-sk-line up-sk-line--name" />
      <div className="up-sk-line up-sk-line--role" />
      <div className="up-sk-actions">
        <div className="up-sk-btn" />
        <div className="up-sk-btn" />
      </div>
    </div>
    <div className="up-sk-sections">
      {[80, 60, 90].map((w, i) => (
        <div key={i} className="up-sk-section">
          <div className="up-sk-line up-sk-line--head" />
          <div className="up-sk-line" style={{ width: `${w}%` }} />
          <div className="up-sk-line" style={{ width: `${w - 15}%` }} />
        </div>
      ))}
    </div>
  </div>
);

// ─── Section block ────────────────────────────────────────────────
const Section = ({ icon, title, children }) => (
  <div className="up-section">
    <h3 className="up-section__title">
      <span className="up-section__icon">{icon}</span>
      {title}
    </h3>
    <div className="up-section__body">{children}</div>
  </div>
);

// ─── Referral Modal ───────────────────────────────────────────────
const ReferralModal = ({ company, onClose, onSubmit, submitting, error }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="up-modal-backdrop" onClick={onClose}>
      <div className="up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="up-modal__header">
          <div>
            <h3 className="up-modal__title">Request Referral</h3>
            <p className="up-modal__subtitle">at <strong>{company}</strong></p>
          </div>
          <button className="up-modal__close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="up-modal__error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
            </svg>
            {error}
          </div>
        )}

        <label className="up-modal__label" htmlFor="up-ref-msg">
          Your message
          <span className="up-modal__char">{message.length} / 300</span>
        </label>
        <textarea
          id="up-ref-msg"
          className="up-modal__textarea"
          placeholder="Briefly introduce yourself and the role you're targeting…"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 300))}
          rows={4}
          autoFocus
        />
        <p className="up-modal__tip">
          💡 Mention your background, target role, and why you'd be a great fit.
        </p>
        <div className="up-modal__actions">
          <button className="up-modal__cancel" onClick={onClose}>Cancel</button>
          <button
            className="up-modal__submit"
            onClick={() => onSubmit(message)}
            disabled={submitting || !message.trim()}
          >
            {submitting ? <><span className="up-modal__spinner" />Sending…</> : 'Send Request →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────
const UserProfile = () => {
  const { id }                        = useParams();
  const { user: currentUser }         = useContext(AuthContext);
  const navigate                      = useNavigate();

  const [profileUser,   setProfileUser]   = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [referralSent,  setReferralSent]  = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const { data } = await axios.get(`/users/${id}`);
      setProfileUser(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (id === currentUser._id) { navigate('/profile'); return; }
    fetchProfile();
  }, [id, currentUser, navigate, fetchProfile]);

  const handleReferralSubmit = async (message) => {
    if (!message.trim()) return;
    setSubmitting(true);
    setReferralError(null);
    try {
      await axios.post('/referrals/request', {
        referrerId: profileUser._id,
        company:    profileUser.company,
        message:    message.trim(),
      });
      setShowModal(false);
      setReferralSent(true);
    } catch (err) {
      setReferralError(err.response?.data?.message || 'Failed to send referral request.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <>
      {/* Inline critical styles for skeleton — full styles load below */}
      <style>{skeletonOnlyStyles}</style>
      <div className="up-root"><div className="up-inner"><SkeletonProfile /></div></div>
    </>
  );

  // ── Error / Not found ────────────────────────────────────────────
  if (fetchError || !profileUser) return (
    <>
      <style>{skeletonOnlyStyles}</style>
      <div className="up-root">
        <div className="up-not-found">
          <div className="up-not-found__icon">👤</div>
          <h2 className="up-not-found__title">User not found</h2>
          <p className="up-not-found__desc">
            This profile doesn't exist or may have been removed.
          </p>
          <button className="up-not-found__btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    </>
  );

  const isReferrer  = profileUser.role === 'employee';
  const canRequest  = currentUser?.role === 'developer' && isReferrer;
  const hasContent  = profileUser.bio || profileUser.experience ||
                      profileUser.skills?.length || profileUser.githubUrl ||
                      profileUser.portfolioUrl || profileUser.resumeUrl;

  return (
    <>
      <style>{fullStyles}</style>

      <div className="up-root">
        <div className="up-inner">

          {/* Back button */}
          <button className="up-back-btn" onClick={() => navigate(-1)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* ── Hero card ── */}
          <div className="up-hero">
            <div className="up-hero__banner" aria-hidden="true" />

            <div className="up-hero__content">
              {/* Avatar */}
              <div className="up-hero__avatar-wrap">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={profileUser.name} className="up-hero__avatar" />
                ) : (
                  <div className="up-hero__avatar-placeholder" aria-hidden="true">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`up-hero__role-dot ${isReferrer ? 'up-hero__role-dot--referrer' : 'up-hero__role-dot--seeker'}`} />
              </div>

              {/* Name + role */}
              <h1 className="up-hero__name">{profileUser.name}</h1>

              <div className="up-hero__role-row">
                <span className={`up-hero__badge ${isReferrer ? 'up-hero__badge--referrer' : 'up-hero__badge--seeker'}`}>
                  {isReferrer ? '🏢 Referrer' : '💻 Job Seeker'}
                </span>
                {profileUser.company && (
                  <span className="up-hero__company">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {profileUser.company}
                  </span>
                )}
                {isReferrer && (
                  <div className="up-hero__rating">
                    <span className="up-hero__rating-icon" role="img" aria-label="Rating">⭐</span>
                    <span className="up-hero__rating-val">{profileUser.rating || 0}</span>
                    <span className="up-hero__rating-lbl">Rating</span>
                  </div>
                )}
              </div>

              {/* Referral sent toast */}
              {referralSent && (
                <div className="up-sent-toast">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Referral request sent!
                </div>
              )}

              {/* CTA buttons */}
              <div className="up-hero__actions">
                <Link to={`/chat/${profileUser._id}`} className="up-hero__btn up-hero__btn--primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Chat
                </Link>

                {profileUser.resumeUrl && (
                  <Link 
                    to={`/resume?url=${encodeURIComponent(profileUser.resumeUrl)}&name=${encodeURIComponent(profileUser.name)}`} 
                    className="up-hero__btn up-hero__btn--outline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Resume
                  </Link>
                )}

                {canRequest && (
                  <button
                    className={`up-hero__btn up-hero__btn--outline ${referralSent ? 'up-hero__btn--sent' : ''}`}
                    onClick={() => !referralSent && setShowModal(true)}
                    disabled={referralSent}
                  >
                    {referralSent ? (
                      <>✓ Requested</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
                        </svg>
                        Request Referral
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Detail sections ── */}
          {hasContent ? (
            <div className="up-sections">

              {profileUser.bio && (
                <Section icon="💬" title="About">
                  <p className="up-body-text">{profileUser.bio}</p>
                </Section>
              )}

              {profileUser.experience && (
                <Section icon="📅" title="Experience">
                  <p className="up-body-text">{profileUser.experience}</p>
                </Section>
              )}

              {profileUser.skills?.length > 0 && (
                <Section icon="⚡" title="Skills & Expertise">
                  <div className="up-chips">
                    {profileUser.skills.map((skill, i) => (
                      <span key={i} className="up-chip">{skill}</span>
                    ))}
                  </div>
                </Section>
              )}

              {(profileUser.githubUrl || profileUser.portfolioUrl || profileUser.resumeUrl) && (
                <Section icon="🔗" title="Links">
                  <div className="up-links">
                    {profileUser.githubUrl && (
                      <a href={profileUser.githubUrl} target="_blank" rel="noopener noreferrer" className="up-link-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {profileUser.portfolioUrl && (
                      <a href={profileUser.portfolioUrl} target="_blank" rel="noopener noreferrer" className="up-link-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Portfolio
                      </a>
                    )}
                    {/* Moved to Hero section for better prominence */}
                  </div>
                </Section>
              )}
            </div>
          ) : (
            <div className="up-empty">
              <div className="up-empty__icon">📋</div>
              <p className="up-empty__text">
                {profileUser.name.split(' ')[0]} hasn't added any details yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Referral Modal ── */}
      {showModal && (
        <ReferralModal
          company={profileUser.company}
          onClose={() => { setShowModal(false); setReferralError(null); }}
          onSubmit={handleReferralSubmit}
          submitting={submitting}
          error={referralError}
        />
      )}
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const baseVars = `
  --up-bg:        #070c18;
  --up-surface:   #0f172a;
  --up-surface-2: #1e293b;
  --up-surface-3: #263548;
  --up-border:    rgba(99,179,237,0.1);
  --up-accent:    #38bdf8;
  --up-accent-2:  #818cf8;
  --up-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
  --up-glow:      rgba(56,189,248,0.1);
  --up-text-1:    #f1f5f9;
  --up-text-2:    #94a3b8;
  --up-text-3:    #64748b;
  --up-success:   #22c55e;
  --up-danger:    #ef4444;
`;

const skeletonOnlyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  .up-root { ${baseVars} font-family:'DM Sans',sans-serif; background:var(--up-bg); min-height:calc(100vh - 80px); padding:3rem 1.5rem 5rem; }
  .up-inner { max-width:780px; margin:0 auto; }
  .up-skeleton { display:flex; flex-direction:column; align-items:center; gap:14px; }
  .up-sk-banner { width:100%; height:140px; border-radius:20px 20px 0 0; background:var(--up-surface); animation:upShimmer 1.4s ease-in-out infinite; }
  .up-sk-body { display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; background:var(--up-surface); padding:0 2rem 2rem; border-radius:0 0 20px 20px; }
  .up-sk-avatar { width:90px; height:90px; border-radius:20px; background:var(--up-surface-2); margin-top:-45px; animation:upShimmer 1.4s ease-in-out infinite; }
  .up-sk-line { height:12px; border-radius:6px; background:var(--up-surface-2); animation:upShimmer 1.4s ease-in-out infinite; }
  .up-sk-line--name { width:200px; height:20px; }
  .up-sk-line--role { width:140px; }
  .up-sk-line--head { width:100px; height:14px; }
  .up-sk-actions { display:flex; gap:10px; margin-top:6px; }
  .up-sk-btn { width:110px; height:38px; border-radius:12px; background:var(--up-surface-2); animation:upShimmer 1.4s ease-in-out infinite; }
  .up-sk-sections { width:100%; display:flex; flex-direction:column; gap:12px; margin-top:8px; }
  .up-sk-section { background:var(--up-surface); border:1px solid var(--up-border); border-radius:16px; padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:10px; }
  @keyframes upShimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
  .up-not-found { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:14px; text-align:center; }
  .up-not-found__icon { font-size:3rem; }
  .up-not-found__title { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:var(--up-text-1); margin:0; }
  .up-not-found__desc { font-size:.9rem; color:var(--up-text-3); max-width:320px; line-height:1.7; margin:0; }
  .up-not-found__btn { background:var(--up-surface); border:1px solid var(--up-border); border-radius:12px; padding:11px 22px; color:var(--up-text-2); font-family:'DM Sans',sans-serif; font-size:.9rem; cursor:pointer; transition:all .18s; }
  .up-not-found__btn:hover { background:var(--up-surface-2); color:var(--up-text-1); }
`;

const fullStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .up-root {
    ${baseVars}
    font-family: 'DM Sans', sans-serif;
    background: var(--up-bg);
    min-height: calc(100vh - 80px);
    padding: 3rem 1.5rem 5rem;
    color: var(--up-text-2);
    position: relative;
    overflow: hidden;
  }

  .up-root::before {
    content: '';
    position: fixed;
    top: -180px; right: -80px;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .up-inner { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }

  /* ── Back button ── */
  .up-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: transparent; border: none;
    color: var(--up-text-3);
    font-family: 'DM Sans', sans-serif;
    font-size: .875rem; font-weight: 500;
    cursor: pointer;
    padding: 0; margin-bottom: 1.5rem;
    transition: color .15s;
  }
  .up-back-btn:hover { color: var(--up-text-1); }

  /* ── Hero card ── */
  .up-hero {
    background: var(--up-surface);
    border: 1px solid var(--up-border);
    border-radius: 22px;
    overflow: hidden;
    margin-bottom: 1.25rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    position: relative;
  }

  .up-hero__banner {
    height: 130px;
    background: linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(129,140,248,0.18) 100%);
    position: relative;
  }

  .up-hero__banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2338bdf8' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .up-hero__content {
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    padding: 0 2rem 2.5rem;
    position: relative;
    z-index: 1;
  }

  /* Avatar */
  .up-hero__avatar-wrap {
    position: relative;
    margin-top: -52px;
    margin-bottom: 1.25rem;
  }

  .up-hero__avatar,
  .up-hero__avatar-placeholder {
    width: 100px; height: 100px;
    border-radius: 22px;
    border: 3px solid var(--up-surface);
    display: block;
  }

  .up-hero__avatar { object-fit: cover; }

  .up-hero__avatar-placeholder {
    background: var(--up-gradient);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 2.2rem; font-weight: 800; color: #fff;
  }

  .up-hero__role-dot {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 2.5px solid var(--up-surface);
  }

  .up-hero__role-dot--referrer { background: #22c55e; box-shadow: 0 0 8px #22c55e; }
  .up-hero__role-dot--seeker   { background: #a78bfa; box-shadow: 0 0 8px #a78bfa; }

  /* Name + role */
  .up-hero__name {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 800;
    color: var(--up-text-1);
    margin: 0 0 10px;
    letter-spacing: -0.4px;
  }

  .up-hero__role-row {
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap; justify-content: center;
    margin-bottom: 1.5rem;
  }

  .up-hero__badge {
    font-size: .68rem; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 100px; border: 1px solid;
  }

  .up-hero__badge--referrer { background:rgba(34,197,94,.1); border-color:rgba(34,197,94,.25); color:#22c55e; }
  .up-hero__badge--seeker   { background:rgba(167,139,250,.1); border-color:rgba(167,139,250,.25); color:#a78bfa; }

  .up-hero__company {
    font-size: .875rem; color: var(--up-accent);
    display: flex; align-items: center; gap: 5px;
  }

  .up-hero__rating {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(56, 189, 248, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.2);
    padding: 3px 12px;
    border-radius: 100px;
  }

  .up-hero__rating-icon { font-size: 0.85rem; }
  .up-hero__rating-val {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    color: var(--up-accent);
    font-size: 0.95rem;
  }
  .up-hero__rating-lbl {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--up-text-3);
  }

  /* Sent toast */
  .up-sent-toast {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(34,197,94,.1);
    border: 1px solid rgba(34,197,94,.3);
    color: #22c55e;
    font-size: .78rem; font-weight: 600;
    padding: 6px 14px; border-radius: 100px;
    margin-bottom: 1rem;
    animation: upFadeIn .3s ease;
  }

  @keyframes upFadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  /* Action buttons */
  .up-hero__actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

  .up-hero__btn {
    display: inline-flex; align-items: center; gap: 7px;
    border-radius: 12px; padding: 10px 22px;
    font-family: 'Syne', sans-serif;
    font-size: .875rem; font-weight: 700;
    letter-spacing: .04em;
    cursor: pointer; text-decoration: none;
    transition: all .18s;
    border: 1.5px solid;
  }

  .up-hero__btn--primary {
    background: var(--up-gradient); border-color: transparent; color: #fff;
    box-shadow: 0 4px 16px rgba(56,189,248,.2);
  }

  .up-hero__btn--primary:hover { opacity: .88; transform: translateY(-1px); }

  .up-hero__btn--outline {
    background: transparent;
    border-color: rgba(56,189,248,.3);
    color: var(--up-accent);
  }

  .up-hero__btn--outline:hover { background: var(--up-glow); border-color: var(--up-accent); }

  .up-hero__btn--sent {
    background: rgba(34,197,94,.08) !important;
    border-color: rgba(34,197,94,.25) !important;
    color: #22c55e !important;
    cursor: default;
  }

  /* ── Detail sections ── */
  .up-sections { display: flex; flex-direction: column; gap: 10px; }

  .up-section {
    background: var(--up-surface);
    border: 1px solid var(--up-border);
    border-radius: 18px;
    overflow: hidden;
    transition: border-color .18s;
  }

  .up-section:hover { border-color: rgba(56,189,248,.18); }

  .up-section__title {
    display: flex; align-items: center; gap: 9px;
    font-family: 'Syne', sans-serif;
    font-size: .8rem; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: var(--up-text-2);
    margin: 0;
    padding: .9rem 1.4rem;
    border-bottom: 1px solid var(--up-border);
    background: rgba(255,255,255,.015);
  }

  .up-section__icon { font-size: .95rem; line-height: 1; }
  .up-section__body { padding: 1.25rem 1.4rem; }

  .up-body-text {
    font-size: .925rem; line-height: 1.75;
    color: var(--up-text-2); margin: 0;
  }

  /* Chips */
  .up-chips { display: flex; flex-wrap: wrap; gap: 8px; }

  .up-chip {
    font-size: .78rem; font-weight: 500;
    padding: 5px 13px; border-radius: 100px;
    background: var(--up-surface-2);
    border: 1px solid var(--up-border);
    color: var(--up-text-2);
    transition: all .15s;
  }

  .up-chip:hover { border-color: rgba(56,189,248,.3); color: var(--up-accent); }

  /* Links */
  .up-links { display: flex; flex-wrap: wrap; gap: 10px; }

  .up-link-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--up-surface-2);
    border: 1px solid var(--up-border);
    border-radius: 11px;
    padding: 9px 16px;
    font-size: .85rem; font-weight: 500;
    color: var(--up-text-2);
    text-decoration: none;
    transition: all .15s;
  }

  .up-link-btn:hover {
    background: var(--up-glow);
    border-color: rgba(56,189,248,.3);
    color: var(--up-accent);
  }

  .up-link-btn--accent {
    background: var(--up-glow);
    border-color: rgba(56,189,248,.25);
    color: var(--up-accent);
  }

  /* Empty */
  .up-empty {
    background: var(--up-surface);
    border: 1px solid var(--up-border);
    border-radius: 18px;
    padding: 3rem;
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }

  .up-empty__icon { font-size: 2rem; opacity: .5; }
  .up-empty__text { font-size: .9rem; color: var(--up-text-3); margin: 0; }

  /* ── Modal ── */
  .up-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(4,9,20,.8);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 1rem;
    animation: upFadeIn .2s ease;
  }

  .up-modal {
    background: #0f172a;
    border: 1px solid rgba(99,179,237,.15);
    border-radius: 20px;
    padding: 2rem; width: 100%; max-width: 480px;
    box-shadow: 0 32px 80px rgba(0,0,0,.5);
    animation: upSlideUp .25s ease;
  }

  @keyframes upSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .up-modal__header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
  .up-modal__title  { font-family:'Syne',sans-serif; font-size:1.25rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
  .up-modal__subtitle { font-size:.85rem; color:#64748b; margin:0; }
  .up-modal__subtitle strong { color:#94a3b8; font-weight:600; }

  .up-modal__close {
    background:#1e293b; border:1px solid rgba(99,179,237,.1);
    border-radius:8px; width:32px; height:32px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:#64748b; transition:all .15s; flex-shrink:0;
  }
  .up-modal__close:hover { background:rgba(239,68,68,.1); color:#ef4444; border-color:rgba(239,68,68,.2); }

  .up-modal__error {
    background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2);
    color:#ef4444; border-radius:10px; padding:10px 14px;
    font-size:.85rem; display:flex; align-items:center; gap:8px;
    margin-bottom:1rem;
  }

  .up-modal__label {
    display:flex; justify-content:space-between; align-items:center;
    font-size:.8rem; font-weight:600; color:#94a3b8;
    margin-bottom:8px; letter-spacing:.03em;
  }
  .up-modal__char { font-weight:400; color:#64748b; font-size:.75rem; }

  .up-modal__textarea {
    width:100%; background:#1e293b;
    border:1.5px solid rgba(99,179,237,.1);
    border-radius:12px; padding:12px 14px;
    color:#f1f5f9; font-family:'DM Sans',sans-serif;
    font-size:.9rem; line-height:1.6; resize:vertical;
    outline:none; box-sizing:border-box;
    transition:border-color .2s, box-shadow .2s;
  }
  .up-modal__textarea::placeholder { color:#475569; }
  .up-modal__textarea:focus { border-color:rgba(56,189,248,.45); box-shadow:0 0 0 3px rgba(56,189,248,.08); }

  .up-modal__tip {
    font-size:.78rem; color:#64748b;
    background:rgba(255,255,255,.02);
    border:1px solid rgba(99,179,237,.08);
    border-radius:8px; padding:8px 12px;
    margin:10px 0 1.5rem; line-height:1.5;
  }

  .up-modal__actions { display:flex; gap:10px; }

  .up-modal__cancel {
    flex:1; padding:11px;
    background:#1e293b; border:1px solid rgba(99,179,237,.1);
    border-radius:11px; color:#94a3b8;
    font-family:'DM Sans',sans-serif; font-size:.9rem;
    cursor:pointer; transition:all .15s;
  }
  .up-modal__cancel:hover { background:#263548; color:#f1f5f9; }

  .up-modal__submit {
    flex:2; padding:11px;
    background:linear-gradient(135deg,#38bdf8,#818cf8);
    border:none; border-radius:11px; color:#fff;
    font-family:'Syne',sans-serif; font-size:.9rem; font-weight:700;
    letter-spacing:.04em; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:opacity .2s;
  }
  .up-modal__submit:hover:not(:disabled) { opacity:.88; }
  .up-modal__submit:disabled { opacity:.55; cursor:not-allowed; }

  .up-modal__spinner {
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,.35);
    border-top-color:#fff; border-radius:50%;
    animation:upSpin .7s linear infinite; display:inline-block;
  }
  @keyframes upSpin { to{transform:rotate(360deg)} }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .up-root { padding: 2rem 1rem 4rem; }
    .up-hero__content { padding: 0 1.25rem 2rem; }
    .up-hero__name { font-size: 1.5rem; }
  }
`;

export default UserProfile;
