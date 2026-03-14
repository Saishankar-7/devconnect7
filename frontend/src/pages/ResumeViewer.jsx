import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ─── Loading overlay ──────────────────────────────────────────────
const LoadingOverlay = () => (
  <div className="rv-loading">
    <div className="rv-loading__spinner" />
    <p className="rv-loading__text">Loading resume…</p>
    <p className="rv-loading__sub">Powered by Google Docs Viewer</p>
  </div>
);

// ─── Invalid URL state ────────────────────────────────────────────
const InvalidUrl = ({ onBack }) => (
  <div className="rv-invalid">
    <div className="rv-invalid__icon">⚠️</div>
    <h2 className="rv-invalid__title">Invalid Resume URL</h2>
    <p className="rv-invalid__desc">
      No resume URL was provided or the link is malformed.
      Please go back and try again.
    </p>
    <button className="rv-invalid__btn" onClick={onBack}>
      ← Go Back
    </button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────
const ResumeViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError]   = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const resumeUrl    = searchParams.get('url');

  const googleViewerUrl = resumeUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`
    : null;

  const handleBack = () => navigate(-1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        .rv-root {
          --rv-bg:        #070c18;
          --rv-surface:   #0f172a;
          --rv-surface-2: #1e293b;
          --rv-border:    rgba(99,179,237,0.1);
          --rv-accent:    #38bdf8;
          --rv-accent-2:  #818cf8;
          --rv-gradient:  linear-gradient(135deg,#38bdf8,#818cf8);
          --rv-glow:      rgba(56,189,248,0.1);
          --rv-text-1:    #f1f5f9;
          --rv-text-2:    #94a3b8;
          --rv-text-3:    #64748b;
          --rv-danger:    #ef4444;
          font-family: 'DM Sans', sans-serif;
          background: var(--rv-bg);
          height: calc(100vh - 70px);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1.5rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glow */
        .rv-root::before {
          content: '';
          position: fixed;
          top: -150px; right: -80px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Topbar ── */
        .rv-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          background: var(--rv-surface);
          border: 1px solid var(--rv-border);
          border-radius: 16px;
          padding: 0.9rem 1.25rem;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        /* Left group */
        .rv-topbar__left { display: flex; align-items: center; gap: 12px; }

        .rv-back-btn {
          background: var(--rv-surface-2);
          border: 1px solid var(--rv-border);
          border-radius: 10px;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--rv-text-2);
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .rv-back-btn:hover {
          background: var(--rv-glow);
          border-color: rgba(56,189,248,0.3);
          color: var(--rv-accent);
        }

        .rv-topbar__title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--rv-text-1);
          margin: 0;
        }

        .rv-topbar__badge {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rv-accent);
          background: var(--rv-glow);
          border: 1px solid rgba(56,189,248,0.2);
          padding: 3px 10px;
          border-radius: 100px;
        }

        /* Right group */
        .rv-topbar__right { display: flex; align-items: center; gap: 8px; }

        .rv-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.825rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.18s;
          white-space: nowrap;
          border: 1px solid;
        }

        .rv-action-btn--ghost {
          background: var(--rv-surface-2);
          border-color: var(--rv-border);
          color: var(--rv-text-2);
        }

        .rv-action-btn--ghost:hover {
          background: var(--rv-glow);
          border-color: rgba(56,189,248,0.3);
          color: var(--rv-accent);
        }

        .rv-action-btn--primary {
          background: var(--rv-gradient);
          border-color: transparent;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .rv-action-btn--primary:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        /* ── Viewer shell ── */
        .rv-viewer {
          flex: 1;
          border-radius: 16px;
          border: 1px solid var(--rv-border);
          background: var(--rv-surface);
          overflow: hidden;
          position: relative;
          z-index: 1;
          min-height: 0;
        }

        /* ── Loading overlay ── */
        .rv-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--rv-surface);
          z-index: 2;
          pointer-events: none;
        }

        .rv-loading__spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--rv-border);
          border-top-color: var(--rv-accent);
          border-radius: 50%;
          animation: rvSpin 0.8s linear infinite;
        }

        @keyframes rvSpin { to { transform: rotate(360deg); } }

        .rv-loading__text {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--rv-text-1);
          margin: 0;
        }

        .rv-loading__sub {
          font-size: 0.78rem;
          color: var(--rv-text-3);
          margin: 0;
        }

        /* ── Error fallback ── */
        .rv-error-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: var(--rv-surface);
          z-index: 2;
          text-align: center;
          padding: 2rem;
        }

        .rv-error-fallback__icon { font-size: 2.5rem; }

        .rv-error-fallback__title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: var(--rv-text-1); margin: 0;
        }

        .rv-error-fallback__desc {
          font-size: 0.875rem; color: var(--rv-text-3);
          max-width: 340px; line-height: 1.6; margin: 0;
        }

        .rv-error-fallback__btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--rv-gradient);
          border: none; border-radius: 12px;
          padding: 11px 22px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .rv-error-fallback__btn:hover { opacity: 0.88; }

        /* ── Iframe ── */
        .rv-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        /* ── Invalid URL screen ── */
        .rv-invalid {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 14px;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .rv-invalid__icon { font-size: 3rem; }

        .rv-invalid__title {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem; font-weight: 800;
          color: var(--rv-text-1); margin: 0;
        }

        .rv-invalid__desc {
          font-size: 0.9rem; color: var(--rv-text-3);
          max-width: 360px; line-height: 1.7; margin: 0;
        }

        .rv-invalid__btn {
          background: var(--rv-surface);
          border: 1px solid var(--rv-border);
          border-radius: 12px;
          padding: 11px 22px;
          color: var(--rv-text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          margin-top: 6px;
        }

        .rv-invalid__btn:hover {
          background: var(--rv-surface-2);
          border-color: rgba(56,189,248,0.3);
          color: var(--rv-text-1);
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .rv-root { padding: 1rem; }
          .rv-topbar__badge { display: none; }
          .rv-topbar__title { font-size: 0.9rem; }
          .rv-action-btn span { display: none; }
          .rv-action-btn { padding: 8px 12px; }
        }
      `}</style>

      <div className="rv-root">

        {/* ── Top bar (always visible) ── */}
        <div className="rv-topbar">
          <div className="rv-topbar__left">
            <button className="rv-back-btn" onClick={handleBack} aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <h2 className="rv-topbar__title">Applicant Resume</h2>
            <span className="rv-topbar__badge">PDF Viewer</span>
          </div>

          {resumeUrl && (
            <div className="rv-topbar__right">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rv-action-btn rv-action-btn--ghost"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Open</span>
              </a>
              <a
                href={resumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="rv-action-btn rv-action-btn--primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download</span>
              </a>
            </div>
          )}
        </div>

        {/* ── Invalid URL ── */}
        {!resumeUrl ? (
          <InvalidUrl onBack={handleBack} />
        ) : (
          /* ── Viewer ── */
          <div className="rv-viewer">

            {/* Loading overlay — visible until iframe fires onLoad */}
            {!iframeLoaded && !iframeError && <LoadingOverlay />}

            {/* Error fallback */}
            {iframeError && (
              <div className="rv-error-fallback">
                <div className="rv-error-fallback__icon">😕</div>
                <h3 className="rv-error-fallback__title">Preview unavailable</h3>
                <p className="rv-error-fallback__desc">
                  The document couldn't be previewed inline. You can still
                  open or download it directly.
                </p>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv-error-fallback__btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Resume
                </a>
              </div>
            )}

            <iframe
              src={googleViewerUrl}
              title="Resume Viewer"
              className="rv-iframe"
              onLoad={() => setIframeLoaded(true)}
              onError={() => { setIframeLoaded(true); setIframeError(true); }}
              style={{ visibility: iframeLoaded && !iframeError ? 'visible' : 'hidden' }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            >
              <p>
                Your browser does not support inline PDFs.{' '}
                <a href={resumeUrl}>Download the PDF</a>.
              </p>
            </iframe>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeViewer;
