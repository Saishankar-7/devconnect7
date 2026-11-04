import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, AlertCircle, ExternalLink } from 'lucide-react';

const ResumeViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const resumeUrl = searchParams.get('url');
  const personName = searchParams.get('name');

  const googleViewerUrl = resumeUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`
    : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-page)',
        height: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
      }}
    >
      {/* Top Controls Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          marginBottom: '1rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleBack} className="btn btn-secondary btn-sm" aria-label="Go back">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {personName ? `${personName}'s Resume` : 'Candidate Resume'}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Verified Developer Document
            </div>
          </div>
        </div>

        {resumeUrl && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <ExternalLink size={14} />
              <span>Open in New Tab</span>
            </a>
            <a
              href={resumeUrl}
              download="Resume.pdf"
              className="btn btn-primary btn-sm"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Embedded Document Viewer Shell */}
      {!resumeUrl ? (
        <div
          className="card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C', marginBottom: '1rem' }}>
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px' }}>
            No Resume Document URL Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: '1.5rem' }}>
            The applicant has not uploaded a resume yet or the document link has expired.
          </p>
          <button onClick={handleBack} className="btn btn-secondary btn-sm">
            ← Return to previous page
          </button>
        </div>
      ) : (
        <div
          className="card"
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Loading Indicator */}
          {!iframeLoaded && !iframeError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                zIndex: 2,
              }}
            >
              <div className="spinner spinner-primary" style={{ width: '28px', height: '28px' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Loading Document Preview...
              </div>
            </div>
          )}

          {/* Error fallback */}
          {iframeError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                padding: '2rem',
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              <FileText size={36} color="var(--primary-blue)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                Inline Preview Unavailable
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px' }}>
                Your browser or document format does not allow direct inline embedding. You can view or download the resume directly.
              </p>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <Download size={14} />
                Download Resume File
              </a>
            </div>
          )}

          <iframe
            src={googleViewerUrl}
            title="Resume Viewer"
            onLoad={() => setIframeLoaded(true)}
            onError={() => {
              setIframeLoaded(true);
              setIframeError(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              visibility: iframeLoaded && !iframeError ? 'visible' : 'hidden',
            }}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default ResumeViewer;
