import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ─── Section wrapper ──────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <div className="pf-section">
    <div className="pf-section__head">
      <span className="pf-section__icon">{icon}</span>
      <h3 className="pf-section__title">{title}</h3>
    </div>
    <div className="pf-section__body">{children}</div>
  </div>
);

// ─── Field ────────────────────────────────────────────────────────
const Field = ({ id, label, hint, children }) => (
  <div className="pf-field">
    <label className="pf-label" htmlFor={id}>
      {label}
      {hint && <span className="pf-label__hint">{hint}</span>}
    </label>
    {children}
  </div>
);

// ─── Skills preview chips ─────────────────────────────────────────
const SkillChips = ({ value }) => {
  const chips = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!chips.length) return null;
  return (
    <div className="pf-chips">
      {chips.map((c, i) => (
        <span key={i} className="pf-chip">{c}</span>
      ))}
    </div>
  );
};

// ─── Avatar uploader ──────────────────────────────────────────────
const AvatarUploader = ({ user, uploading, onChange }) => {
  const inputRef = useRef(null);
  const letter   = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="pf-avatar-wrap">
      <div className="pf-avatar" onClick={() => inputRef.current?.click()} title="Click to change avatar">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="pf-avatar__img" />
        ) : (
          <span className="pf-avatar__letter">{letter}</span>
        )}
        <div className="pf-avatar__overlay">
          {uploading ? (
            <span className="pf-avatar__spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
        </div>
      </div>
      <div className="pf-avatar__meta">
        <p className="pf-avatar__name">{user?.name}</p>
        <p className="pf-avatar__role">
          {user?.role === 'developer' ? '💻 Job Seeker' : '🏢 Referrer'}
          {user?.company && <span className="pf-avatar__company"> · {user.company}</span>}
        </p>
        <button type="button" className="pf-avatar__change-btn" onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Change photo'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        style={{ display: 'none' }}
        aria-label="Upload avatar"
      />
    </div>
  );
};

// ─── Profile ──────────────────────────────────────────────────────
const Profile = () => {
  const { user, updateUser, loading: authLoading } = useContext(AuthContext);
  const navigate             = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', company: '',
    skills: '', bio: '', githubUrl: '',
    portfolioUrl: '', experience: '',
  });

  const [toast,           setToast]           = useState(null);  // { type: 'success'|'error', text }
  const [saving,          setSaving]          = useState(false);
  const [uploading,       setUploading]       = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setFormData({
      name:         user.name         || '',
      email:        user.email        || '',
      company:      user.company      || '',
      skills:       user.skills?.join(', ') || '',
      bio:          user.bio          || '',
      githubUrl:    user.githubUrl    || '',
      portfolioUrl: user.portfolioUrl || '',
      experience:   user.experience   || '',
    });
  }, [authLoading, user, navigate]);

  if (authLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>Loading profile...</div>;
  if (!user) return null;

  const showToast = (type, text) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Avatar upload ─────────────────────────────────────────────
  const uploadAvatarHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const { data }            = await axios.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: updated }   = await axios.put('/users/profile', { avatarUrl: data.url });
      updateUser(updated);
      showToast('success', 'Avatar updated!');
    } catch {
      showToast('error', 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  // ── Resume upload ─────────────────────────────────────────────
  const uploadResumeHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploadingResume(true);
    try {
      const { data }            = await axios.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: updated }   = await axios.put('/users/profile', { resumeUrl: data.url });
      updateUser(updated);
      showToast('success', 'Resume uploaded!');
    } catch {
      showToast('error', 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // ── Save profile ──────────────────────────────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skills
        ? String(formData.skills).split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const { data: updated } = await axios.put('/users/profile', {
        name:         formData.name,
        email:        formData.email,
        company:      formData.company,
        skills:       skillsArray,
        bio:          formData.bio,
        githubUrl:    formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        experience:   formData.experience,
      });
      updateUser(updated);
      showToast('success', 'Profile saved successfully!');
    } catch {
      showToast('error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isDev = user.role === 'developer';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .pf-root {
          --pf-bg:        #070c18;
          --pf-surface:   #0f172a;
          --pf-surface-2: #1e293b;
          --pf-surface-3: #263548;
          --pf-border:    rgba(99,179,237,0.1);
          --pf-accent:    #38bdf8;
          --pf-accent-2:  #818cf8;
          --pf-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
          --pf-glow:      rgba(56,189,248,0.1);
          --pf-text-1:    #f1f5f9;
          --pf-text-2:    #94a3b8;
          --pf-text-3:    #64748b;
          --pf-success:   #22c55e;
          --pf-danger:    #ef4444;
          font-family: 'DM Sans', sans-serif;
          background: var(--pf-bg);
          min-height: calc(100vh - 80px);
          padding: 3rem 1.5rem 5rem;
          color: var(--pf-text-2);
          position: relative;
          overflow: hidden;
        }

        .pf-root::before {
          content: '';
          position: fixed;
          top: -180px; right: -80px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .pf-inner {
          max-width: 760px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Top bar ── */
        .pf-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pf-topbar__eyebrow {
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--pf-accent); margin: 0 0 6px;
        }

        .pf-topbar__title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.3rem);
          font-weight: 800;
          color: var(--pf-text-1);
          margin: 0; letter-spacing: -0.4px;
        }

        .pf-topbar__title span {
          background: var(--pf-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pf-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--pf-surface);
          border: 1px solid var(--pf-border);
          border-radius: 11px;
          padding: 10px 16px;
          color: var(--pf-text-2);
          font-size: 0.875rem; font-weight: 500;
          text-decoration: none;
          transition: all 0.18s;
          margin-top: 4px; flex-shrink: 0;
        }

        .pf-back-btn:hover {
          background: var(--pf-surface-2);
          border-color: rgba(56,189,248,0.3);
          color: var(--pf-text-1);
        }

        /* ── Toast ── */
        .pf-toast {
          position: fixed;
          bottom: 28px; right: 28px;
          padding: 13px 20px;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; gap: 10px;
          z-index: 999;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          animation: pfSlideUp 0.3s ease;
        }

        .pf-toast--success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: var(--pf-success);
        }

        .pf-toast--error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: var(--pf-danger);
        }

        @keyframes pfSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Avatar ── */
        .pf-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.75rem;
          background: var(--pf-surface);
          border: 1px solid var(--pf-border);
          border-radius: 20px;
          margin-bottom: 1.5rem;
          position: relative; overflow: hidden;
        }

        .pf-avatar-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at top left, rgba(56,189,248,0.04), transparent 60%);
          pointer-events: none;
        }

        .pf-avatar {
          width: 80px; height: 80px;
          border-radius: 20px;
          background: var(--pf-gradient);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800; color: #fff;
          flex-shrink: 0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
          border: 2px solid rgba(56,189,248,0.15);
        }

        .pf-avatar:hover { transform: scale(1.03); }

        .pf-avatar__img {
          width: 100%; height: 100%;
          object-fit: cover; border-radius: 18px;
        }

        .pf-avatar__overlay {
          position: absolute; inset: 0;
          background: rgba(7,12,24,0.6);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          border-radius: 18px;
          color: #fff;
        }

        .pf-avatar:hover .pf-avatar__overlay { opacity: 1; }

        .pf-avatar__spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pfSpin 0.7s linear infinite;
          display: block;
        }

        @keyframes pfSpin { to { transform: rotate(360deg); } }

        .pf-avatar__meta { flex: 1; min-width: 0; }

        .pf-avatar__name {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: var(--pf-text-1); margin: 0 0 4px;
        }

        .pf-avatar__role {
          font-size: 0.85rem; color: var(--pf-text-3); margin: 0 0 10px;
        }

        .pf-avatar__company { color: var(--pf-accent); }

        .pf-avatar__change-btn {
          background: var(--pf-surface-2);
          border: 1px solid var(--pf-border);
          border-radius: 9px;
          padding: 7px 16px;
          color: var(--pf-text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pf-avatar__change-btn:hover {
          background: var(--pf-glow);
          border-color: rgba(56,189,248,0.3);
          color: var(--pf-accent);
        }

        /* ── Sections ── */
        .pf-section {
          background: var(--pf-surface);
          border: 1px solid var(--pf-border);
          border-radius: 20px;
          margin-bottom: 1.25rem;
          overflow: hidden;
        }

        .pf-section__head {
          display: flex; align-items: center; gap: 10px;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--pf-border);
          background: rgba(255,255,255,0.015);
        }

        .pf-section__icon { font-size: 1rem; line-height: 1; }

        .pf-section__title {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--pf-text-2); margin: 0;
        }

        .pf-section__body {
          padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }

        .pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* ── Fields ── */
        .pf-field { display: flex; flex-direction: column; gap: 7px; }

        .pf-label {
          font-size: 0.8rem; font-weight: 600;
          color: var(--pf-text-2); letter-spacing: 0.03em;
          display: flex; justify-content: space-between; align-items: center;
        }

        .pf-label__hint {
          font-size: 0.72rem; font-weight: 400;
          color: var(--pf-text-3);
        }

        .pf-input, .pf-textarea {
          background: var(--pf-surface-2);
          border: 1.5px solid var(--pf-border);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--pf-text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%; box-sizing: border-box;
        }

        .pf-input::placeholder, .pf-textarea::placeholder { color: var(--pf-text-3); }

        .pf-input:focus, .pf-textarea:focus {
          border-color: rgba(56,189,248,0.45);
          box-shadow: 0 0 0 3px var(--pf-glow);
        }

        .pf-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

        /* Input with icon prefix */
        .pf-input-wrap { position: relative; }

        .pf-input-prefix {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--pf-text-3);
          display: flex; pointer-events: none;
        }

        .pf-input--prefixed { padding-left: 36px; }

        /* ── Skills chips ── */
        .pf-chips {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin-top: 6px;
        }

        .pf-chip {
          font-size: 0.72rem; font-weight: 500;
          padding: 3px 10px; border-radius: 100px;
          background: var(--pf-surface-2);
          border: 1px solid var(--pf-border);
          color: var(--pf-text-2);
        }

        /* ── File upload ── */
        .pf-file-zone {
          border: 1.5px dashed var(--pf-border);
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          background: rgba(255,255,255,0.01);
        }

        .pf-file-zone:hover {
          border-color: rgba(56,189,248,0.35);
          background: var(--pf-glow);
        }

        .pf-file-zone__input {
          position: absolute; inset: 0;
          opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }

        .pf-file-zone__icon {
          font-size: 1.5rem; margin-bottom: 6px;
        }

        .pf-file-zone__label {
          font-size: 0.85rem; color: var(--pf-text-2); margin: 0 0 3px;
        }

        .pf-file-zone__sub {
          font-size: 0.75rem; color: var(--pf-text-3); margin: 0;
        }

        .pf-file-zone__uploading {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 0.85rem; color: var(--pf-accent);
        }

        .pf-file-zone__spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(56,189,248,0.3);
          border-top-color: var(--pf-accent);
          border-radius: 50%;
          animation: pfSpin 0.7s linear infinite;
          display: inline-block;
        }

        .pf-resume-existing {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.8rem; color: var(--pf-accent);
          text-decoration: none; margin-top: 8px;
          background: var(--pf-glow);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 8px;
          padding: 5px 12px;
          transition: opacity 0.15s;
        }

        .pf-resume-existing:hover { opacity: 0.8; }

        /* ── Submit bar ── */
        .pf-submit-bar {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 12px; padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--pf-border);
          background: var(--pf-surface);
          border-radius: 0 0 20px 20px;
          margin-top: -1px;
        }

        .pf-submit-btn {
          background: var(--pf-gradient);
          border: none; border-radius: 12px;
          padding: 12px 28px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
        }

        .pf-submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .pf-submit-btn:disabled             { opacity: 0.55; cursor: not-allowed; }

        .pf-submit-btn__spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pfSpin 0.7s linear infinite;
        }

        .pf-save-note {
          font-size: 0.78rem; color: var(--pf-text-3);
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .pf-root       { padding: 2rem 1rem 4rem; }
          .pf-row        { grid-template-columns: 1fr; }
          .pf-avatar-wrap{ flex-direction: column; align-items: flex-start; }
          .pf-submit-bar { flex-direction: column; align-items: stretch; }
          .pf-submit-btn { justify-content: center; }
        }
      `}</style>

      <div className="pf-root">
        <div className="pf-inner">

          {/* ── Top bar ── */}
          <div className="pf-topbar">
            <div>
              <p className="pf-topbar__eyebrow">Account</p>
              <h1 className="pf-topbar__title">Edit <span>Profile</span></h1>
            </div>
            <Link to="/dashboard" className="pf-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Dashboard
            </Link>
          </div>

          {/* ── Avatar card ── */}
          <AvatarUploader user={user} uploading={uploading} onChange={uploadAvatarHandler} />

          <form onSubmit={submitHandler} noValidate>

            {/* ── Basic info ── */}
            <Section title="Basic Information" icon="👤">
              <div className="pf-row">
                <Field id="name" label="Full Name">
                  <input
                    id="name" name="name" type="text"
                    className="pf-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={onChange}
                    required
                    autoComplete="name"
                  />
                </Field>
                <Field id="email" label="Email Address">
                  <input
                    id="email" name="email" type="email"
                    className="pf-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={onChange}
                    required
                    autoComplete="email"
                  />
                </Field>
              </div>
              <Field id="bio" label="Bio" hint="Max 300 chars">
                <textarea
                  id="bio" name="bio"
                  className="pf-textarea"
                  rows={4}
                  placeholder="Tell developers / referrers a bit about yourself…"
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) onChange(e);
                  }}
                />
              </Field>
            </Section>

            {/* ── Referrer-only ── */}
            {!isDev && (
              <Section title="Company Details" icon="🏢">
                <div className="pf-row">
                  <Field id="company" label="Company">
                    <input
                      id="company" name="company" type="text"
                      className="pf-input"
                      placeholder="Google, Meta, Stripe…"
                      value={formData.company}
                      onChange={onChange}
                    />
                  </Field>
                  <Field id="experience" label="Years of Experience">
                    <input
                      id="experience" name="experience" type="text"
                      className="pf-input"
                      placeholder="e.g. 5+ years"
                      value={formData.experience}
                      onChange={onChange}
                    />
                  </Field>
                </div>
              </Section>
            )}

            {/* ── Developer-only ── */}
            {isDev && (
              <>
                <Section title="Skills & Links" icon="⚡">
                  <Field id="skills" label="Skills" hint="Comma separated">
                    <input
                      id="skills" name="skills" type="text"
                      className="pf-input"
                      placeholder="React, Node.js, Python, Go…"
                      value={formData.skills}
                      onChange={onChange}
                    />
                    <SkillChips value={formData.skills} />
                  </Field>
                  <div className="pf-row">
                    <Field id="githubUrl" label="GitHub">
                      <div className="pf-input-wrap">
                        <span className="pf-input-prefix">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        </span>
                        <input
                          id="githubUrl" name="githubUrl" type="url"
                          className="pf-input pf-input--prefixed"
                          placeholder="https://github.com/username"
                          value={formData.githubUrl}
                          onChange={onChange}
                        />
                      </div>
                    </Field>
                    <Field id="portfolioUrl" label="Portfolio">
                      <div className="pf-input-wrap">
                        <span className="pf-input-prefix">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                        </span>
                        <input
                          id="portfolioUrl" name="portfolioUrl" type="url"
                          className="pf-input pf-input--prefixed"
                          placeholder="https://yourportfolio.com"
                          value={formData.portfolioUrl}
                          onChange={onChange}
                        />
                      </div>
                    </Field>
                  </div>
                </Section>

                <Section title="Resume" icon="📄">
                  <Field id="resume" label="Upload Resume" hint="PDF, DOC, DOCX">
                    <div className="pf-file-zone">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="pf-file-zone__input"
                        onChange={uploadResumeHandler}
                        disabled={uploadingResume}
                        aria-label="Upload resume"
                      />
                      {uploadingResume ? (
                        <div className="pf-file-zone__uploading">
                          <span className="pf-file-zone__spinner" />
                          Uploading resume…
                        </div>
                      ) : (
                        <>
                          <div className="pf-file-zone__icon">📎</div>
                          <p className="pf-file-zone__label">
                            Drag & drop or <strong style={{ color: 'var(--pf-accent)' }}>browse</strong>
                          </p>
                          <p className="pf-file-zone__sub">PDF, DOC or DOCX · max 5MB</p>
                        </>
                      )}
                    </div>
                    {user?.resumeUrl && (
                      <Link
                        to={`/resume?url=${encodeURIComponent(user.resumeUrl)}&name=${encodeURIComponent(user.name)}`}
                        className="pf-resume-existing"
                      >
                        📄 View current resume
                      </Link>
                    )}
                  </Field>
                </Section>
              </>
            )}

            {/* ── Submit bar ── */}
            <div className="pf-submit-bar">
              <span className="pf-save-note">Changes are saved to your account immediately.</span>
              <button type="submit" className="pf-submit-btn" disabled={saving}>
                {saving ? (
                  <><span className="pf-submit-btn__spinner" />Saving…</>
                ) : (
                  <>Save Changes ✓</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pf-toast pf-toast--${toast.type}`} role="status">
          {toast.type === 'success' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
            </svg>
          )}
          {toast.text}
        </div>
      )}
    </>
  );
};

export default Profile;
