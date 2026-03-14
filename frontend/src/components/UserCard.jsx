import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// ─── Referral Request Modal ───────────────────────────────────────
const ReferralModal = ({ employee, onClose, onSuccess }) => {
  const [message, setMessage]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await axios.post('/referrals/request', {
        referrerId: employee._id,
        company:    employee.company,
        message:    message.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="uc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="uc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="uc-modal__header">
          <div>
            <h3 className="uc-modal__title">Request Referral</h3>
            <p className="uc-modal__subtitle">
              at <strong>{employee.company}</strong> via {employee.name}
            </p>
          </div>
          <button className="uc-modal__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="uc-modal__error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="uc-modal__label" htmlFor="ref-message">
            Your message
            <span className="uc-modal__char">{message.length} / 300</span>
          </label>
          <textarea
            id="ref-message"
            className="uc-modal__textarea"
            placeholder="Hi! I'm a frontend developer with 3 years of experience in React. I'd love a referral opportunity at your company..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 300))}
            rows={4}
            required
            autoFocus
          />
          <div className="uc-modal__tip">
            💡 Briefly mention your background, the role you're targeting, and why you'd be a great fit.
          </div>
          <div className="uc-modal__actions">
            <button type="button" className="uc-modal__cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="uc-modal__submit"
              disabled={submitting || !message.trim()}
            >
              {submitting ? (
                <><span className="uc-modal__spinner" /> Sending…</>
              ) : 'Send Request →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── User Card ────────────────────────────────────────────────────
const UserCard = ({ employee, hasRequested: initialHasRequested }) => {
  const { user }        = useContext(AuthContext);
  const [showModal, setShowModal]         = useState(false);
  const [hasRequested, setHasRequested]   = useState(initialHasRequested);
  const [justSent, setJustSent]           = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    setHasRequested(true);
    setJustSent(true);
  };

  const isReferrer  = employee.role === 'employee';
  const avatarLetter = employee.name?.charAt(0).toUpperCase() ?? '?';
  const bio = employee.bio
    ? employee.bio.length > 110 ? `${employee.bio.slice(0, 110)}…` : employee.bio
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .uc-card {
          --uc-bg:       #0f172a;
          --uc-bg2:      #1e293b;
          --uc-border:   rgba(99,179,237,0.1);
          --uc-accent:   #38bdf8;
          --uc-accent-2: #818cf8;
          --uc-gradient: linear-gradient(135deg,#38bdf8,#818cf8);
          --uc-glow:     rgba(56,189,248,0.1);
          --uc-text-1:   #f1f5f9;
          --uc-text-2:   #94a3b8;
          --uc-text-3:   #64748b;
          --uc-success:  #22c55e;
          --uc-success-bg: rgba(34,197,94,0.1);
          --uc-purple:   #a78bfa;
          --uc-purple-bg: rgba(167,139,250,0.1);
          --uc-danger:   #ef4444;
          --uc-danger-bg: rgba(239,68,68,0.08);
          font-family: 'DM Sans', sans-serif;
          background: var(--uc-bg);
          border: 1px solid var(--uc-border);
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .uc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(56,189,248,0.04), transparent 60%);
          pointer-events: none;
        }

        .uc-card:hover {
          border-color: rgba(56,189,248,0.22);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(56,189,248,0.06);
          transform: translateY(-2px);
        }

        /* ── Header ── */
        .uc-card__header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 1.1rem;
        }

        .uc-card__avatar {
          width: 54px; height: 54px;
          border-radius: 14px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1.5px solid var(--uc-border);
        }

        .uc-card__avatar-placeholder {
          width: 54px; height: 54px;
          border-radius: 14px;
          background: var(--uc-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.5px;
        }

        .uc-card__identity { flex: 1; min-width: 0; }

        .uc-card__name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--uc-text-1);
          margin: 0 0 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .uc-card__badge {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 100px;
          line-height: 1.6;
        }

        .uc-card__badge--referrer {
          background: var(--uc-success-bg);
          color: var(--uc-success);
          border: 1px solid rgba(34,197,94,0.2);
        }

        .uc-card__badge--seeker {
          background: var(--uc-purple-bg);
          color: var(--uc-purple);
          border: 1px solid rgba(167,139,250,0.2);
        }

        .uc-card__company {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--uc-accent);
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0;
        }

        /* ── Bio ── */
        .uc-card__bio {
          font-size: 0.875rem;
          line-height: 1.65;
          color: var(--uc-text-3);
          flex-grow: 1;
          margin-bottom: 1rem;
        }

        .uc-card__bio--empty {
          font-style: italic;
        }

        /* ── Skills ── */
        .uc-card__skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 1.25rem;
        }

        .uc-card__skill {
          font-size: 0.72rem;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 100px;
          background: var(--uc-bg2);
          border: 1px solid var(--uc-border);
          color: var(--uc-text-2);
          letter-spacing: 0.02em;
        }

        .uc-card__skill-more {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 100px;
          background: var(--uc-glow);
          border: 1px solid rgba(56,189,248,0.2);
          color: var(--uc-accent);
        }

        /* ── Actions ── */
        .uc-card__actions { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

        .uc-card__req-btn {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: 11px;
          background: var(--uc-gradient);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.855rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        .uc-card__req-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .uc-card__req-btn:disabled {
          background: var(--uc-bg2);
          color: var(--uc-text-3);
          border: 1px solid var(--uc-border);
          cursor: not-allowed;
          transform: none;
        }

        .uc-card__req-btn--sent {
          background: var(--uc-success-bg) !important;
          border: 1px solid rgba(34,197,94,0.25) !important;
          color: var(--uc-success) !important;
        }

        .uc-card__link-row { display: flex; gap: 8px; }

        .uc-card__link-btn {
          flex: 1;
          padding: 10px;
          border-radius: 11px;
          background: var(--uc-bg2);
          border: 1px solid var(--uc-border);
          color: var(--uc-text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.18s ease;
        }

        .uc-card__link-btn:hover {
          background: var(--uc-glow);
          border-color: rgba(56,189,248,0.3);
          color: var(--uc-accent);
        }

        .uc-card__info-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--uc-text-3);
          padding: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--uc-border);
          border-radius: 10px;
        }

        /* ── Success toast ── */
        .uc-card__toast {
          position: absolute;
          top: 14px; right: 14px;
          background: var(--uc-success-bg);
          border: 1px solid rgba(34,197,94,0.3);
          color: var(--uc-success);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 5px;
          animation: ucFadeIn 0.3s ease;
          z-index: 2;
        }

        @keyframes ucFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Modal ── */
        .uc-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 9, 20, 0.8);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: ucFadeIn 0.2s ease;
        }

        .uc-modal {
          background: #0f172a;
          border: 1px solid rgba(99,179,237,0.15);
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          animation: ucSlideUp 0.25s ease;
        }

        @keyframes ucSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .uc-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .uc-modal__title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }

        .uc-modal__subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .uc-modal__subtitle strong { color: #94a3b8; font-weight: 600; }

        .uc-modal__close {
          background: #1e293b;
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .uc-modal__close:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }

        .uc-modal__error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
        }

        .uc-modal__label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 8px;
          letter-spacing: 0.03em;
        }

        .uc-modal__char { font-weight: 400; color: #64748b; font-size: 0.75rem; }

        .uc-modal__textarea {
          width: 100%;
          background: #1e293b;
          border: 1.5px solid rgba(99,179,237,0.1);
          border-radius: 12px;
          padding: 12px 14px;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .uc-modal__textarea::placeholder { color: #475569; }

        .uc-modal__textarea:focus {
          border-color: rgba(56,189,248,0.45);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }

        .uc-modal__tip {
          font-size: 0.78rem;
          color: #64748b;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(99,179,237,0.08);
          border-radius: 8px;
          padding: 8px 12px;
          margin: 10px 0 1.5rem;
          line-height: 1.5;
        }

        .uc-modal__actions { display: flex; gap: 10px; }

        .uc-modal__cancel {
          flex: 1;
          padding: 11px;
          background: #1e293b;
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 11px;
          color: #94a3b8;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .uc-modal__cancel:hover { background: #263548; color: #f1f5f9; }

        .uc-modal__submit {
          flex: 2;
          padding: 11px;
          background: linear-gradient(135deg,#38bdf8,#818cf8);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .uc-modal__submit:hover:not(:disabled) { opacity: 0.88; }
        .uc-modal__submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .uc-modal__spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ucSpin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes ucSpin { to { transform: rotate(360deg); } }
      `}</style>

      <article className="uc-card">

        {/* Success toast */}
        {justSent && (
          <div className="uc-card__toast">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Request sent!
          </div>
        )}

        {/* Header */}
        <div className="uc-card__header">
          {employee.avatarUrl ? (
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className="uc-card__avatar"
            />
          ) : (
            <div className="uc-card__avatar-placeholder" aria-hidden="true">
              {avatarLetter}
            </div>
          )}
          <div className="uc-card__identity">
            <h3 className="uc-card__name">
              {employee.name}
              <span className={`uc-card__badge ${isReferrer ? 'uc-card__badge--referrer' : 'uc-card__badge--seeker'}`}>
                {isReferrer ? 'Referrer' : 'Seeker'}
              </span>
            </h3>
            {employee.company && (
              <p className="uc-card__company">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {employee.company}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className={`uc-card__bio ${!employee.bio ? 'uc-card__bio--empty' : ''}`}>
          {bio ?? 'No bio provided.'}
        </p>

        {/* Skills */}
        {employee.skills?.length > 0 && (
          <div className="uc-card__skills">
            {employee.skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="uc-card__skill">{skill}</span>
            ))}
            {employee.skills.length > 4 && (
              <span className="uc-card__skill-more">+{employee.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="uc-card__actions">
          {user?.role === 'developer' ? (
            isReferrer && (
              <button
                className={`uc-card__req-btn ${hasRequested ? 'uc-card__req-btn--sent' : ''}`}
                onClick={() => !hasRequested && setShowModal(true)}
                disabled={hasRequested}
                aria-label={hasRequested ? 'Referral already requested' : `Request referral from ${employee.name}`}
              >
                {hasRequested ? '✓ Referral Requested' : `Request Referral at ${employee.company}`}
              </button>
            )
          ) : (
            <div className="uc-card__info-note">
              Only job seekers can request referrals
            </div>
          )}

          <div className="uc-card__link-row">
            <Link to={`/profile/${employee._id}`} className="uc-card__link-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </Link>
            <Link to={`/chat/${employee._id}`} className="uc-card__link-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat
            </Link>
          </div>
        </div>
      </article>

      {/* Referral Modal */}
      {showModal && (
        <ReferralModal
          employee={employee}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default UserCard;
