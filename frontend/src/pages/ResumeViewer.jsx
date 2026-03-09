import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResumeViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract URL parameter
  const searchParams = new URLSearchParams(location.search);
  const resumeUrl = searchParams.get('url');

  if (!resumeUrl) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Invalid Resume URL</h2>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  // Ensure it's rendered securely
  // We can just use a standard object embed or an iframe to display PDFs natively in-browser
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', padding: '1rem', backgroundColor: 'var(--bg-card)' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
        <button onClick={() => window.close()} className="btn btn-outline" style={{ border: 'none', color: 'var(--text-secondary)' }}>
          ← Close Window
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Applicant Resume</h2>
        <a 
          href={resumeUrl} 
          download 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Download PDF
        </a>
      </div>

      {/* PDF Embed / Viewer using Google Docs Viewer to bypass Cloudinary embed restrictions */}
      <div style={{ flexGrow: 1, borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`} 
          title="Resume Viewer"
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
        >
          <p>Your browser does not support inline PDFs. <a href={resumeUrl}>Download the PDF</a>.</p>
        </iframe>
      </div>
    </div>
  );
};

export default ResumeViewer;
