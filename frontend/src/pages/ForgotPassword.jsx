import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side */}
        <div className="auth-brand-side">
          <div>
            <Logo size="lg" to="/" />
          </div>
          <div className="auth-brand-content">
            <h2 className="auth-brand-heading">
              Secure account recovery.
            </h2>
            <p className="auth-brand-sub">
              Forgot your credentials? We will send you secure instructions to restore access to your DevConnect profile and referral dashboard.
            </p>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            © DevConnect Inc. All credentials are encrypted with TLS 1.3.
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-form-side">
          <div className="auth-card-inner">
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84375rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              <ArrowLeft size={14} />
              Back to Sign in
            </Link>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Check your inbox
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  We have sent password recovery instructions to <strong>{email}</strong>. Follow the link inside to set up a new password.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <h1 className="auth-title">Reset password</h1>
                  <p className="auth-subtitle">
                    Enter the email associated with your account and we'll send a recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="recovery-email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                        <Mail size={16} />
                      </span>
                      <input
                        id="recovery-email"
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Sending Link...
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Link</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-footer">
                  Remember your password?{' '}
                  <Link to="/login">Sign in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

