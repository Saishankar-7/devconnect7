import React, { useState } from 'react';

// ─── Delivery status icon ─────────────────────────────────────────
const StatusIcon = ({ pending, failed }) => {
  if (pending) return (
    <svg className="mb-status mb-status--pending" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
    </svg>
  );
  if (failed) return (
    <svg className="mb-status mb-status--failed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
    </svg>
  );
  return (
    <svg className="mb-status mb-status--sent" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────
const MessageBubble = ({ message, isMine }) => {
  const [showTime, setShowTime] = useState(false);

  const timeLabel = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <style>{`
        .mb-row {
          --mb-mine-bg:   linear-gradient(135deg, #38bdf8, #818cf8);
          --mb-theirs-bg: #1e293b;
          --mb-mine-text:   #fff;
          --mb-theirs-text: #e2e8f0;
          --mb-time:        rgba(255,255,255,0.45);
          --mb-border:      rgba(99,179,237,0.12);
          --mb-pending:     rgba(255,255,255,0.45);
          --mb-failed:      #ef4444;
          --mb-sent:        rgba(255,255,255,0.55);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 3px;
          animation: mbFadeUp 0.2s ease forwards;
        }

        @keyframes mbFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mb-row--mine   { justify-content: flex-end; }
        .mb-row--theirs { justify-content: flex-start; }

        /* ── Bubble ── */
        .mb-bubble {
          position: relative;
          max-width: 72%;
          padding: 10px 14px 8px;
          cursor: default;
          transition: transform 0.15s ease;
          word-break: break-word;
        }

        .mb-bubble:hover { transform: scale(1.01); }

        /* Mine */
        .mb-bubble--mine {
          background: var(--mb-mine-bg);
          color: var(--mb-mine-text);
          border-radius: 18px 18px 4px 18px;
          box-shadow: 0 4px 16px rgba(56,189,248,0.18);
        }

        /* Theirs */
        .mb-bubble--theirs {
          background: var(--mb-theirs-bg);
          color: var(--mb-theirs-text);
          border: 1px solid var(--mb-border);
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Failed state */
        .mb-bubble--failed {
          background: rgba(239,68,68,0.12) !important;
          border: 1px solid rgba(239,68,68,0.25) !important;
          box-shadow: none !important;
        }

        /* Pending state */
        .mb-bubble--pending { opacity: 0.65; }

        /* ── Text ── */
        .mb-text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.55;
        }

        /* ── Footer row (time + status) ── */
        .mb-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          justify-content: flex-end;
        }

        .mb-time {
          font-size: 0.67rem;
          color: var(--mb-time);
          white-space: nowrap;
          transition: opacity 0.2s;
          opacity: 0;
        }

        .mb-row:hover .mb-time,
        .mb-time--visible { opacity: 1; }

        /* ── Status icons ── */
        .mb-status { display: block; }

        .mb-status--pending {
          color: var(--mb-pending);
          animation: mbSpin 1.5s linear infinite;
        }

        @keyframes mbSpin { to { transform: rotate(360deg); } }

        .mb-status--failed { color: var(--mb-failed); }
        .mb-status--sent   { color: var(--mb-sent); }

        /* ── Failed retry label ── */
        .mb-failed-label {
          font-size: 0.68rem;
          color: #ef4444;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
        }

        /* ── Theirs time (left-aligned) ── */
        .mb-row--theirs .mb-footer { justify-content: flex-start; }
        .mb-row--theirs .mb-time   { color: rgba(148,163,184,0.6); }

        /* ── Tooltip on tap (mobile) ── */
        .mb-time--tap { opacity: 1 !important; }

        @media (max-width: 480px) {
          .mb-bubble { max-width: 82%; padding: 9px 12px 7px; }
          .mb-text   { font-size: 0.875rem; }
        }
      `}</style>

      <div
        className={`mb-row ${isMine ? 'mb-row--mine' : 'mb-row--theirs'}`}
        role="listitem"
      >
        <div
          className={[
            'mb-bubble',
            isMine    ? 'mb-bubble--mine'    : 'mb-bubble--theirs',
            message.pending ? 'mb-bubble--pending' : '',
            message.failed  ? 'mb-bubble--failed'  : '',
          ].filter(Boolean).join(' ')}
          onClick={() => setShowTime((v) => !v)}
          title={timeLabel}
        >
          <p className="mb-text">{message.content}</p>

          <div className="mb-footer">
            <span className={`mb-time ${showTime ? 'mb-time--visible' : ''}`}>
              {timeLabel}
            </span>
            {isMine && (
              <StatusIcon pending={message.pending} failed={message.failed} />
            )}
          </div>

          {/* Failed retry hint */}
          {message.failed && isMine && (
            <p className="mb-failed-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Failed · Tap to retry
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
