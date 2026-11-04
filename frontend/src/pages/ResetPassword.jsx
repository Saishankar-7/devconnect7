import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Login.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6 || password !== confirmPassword) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
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
              Secure account update.
            </h2>
            <p className="auth-brand-sub">
              Create a new strong password for your DevConnect account to continue exploring career opportunities and referrers.
            </p>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            © DevConnect Inc. All credentials protected.
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-form-side">
          <div className="auth-card-inner">
            {completed ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
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
                  Password updated
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Your password has been reset successfully. You can now log in with your new credentials.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Log In to DevConnect
                </Link>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <h1 className="auth-title">Create new password</h1>
                  <p className="auth-subtitle">
                    Enter a new secure password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-pass">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                        <Lock size={16} />
                      </span>
                      <input
                        id="new-pass"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: '36px', paddingRight: '40px' }}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-pass">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                        <Lock size={16} />
                      </span>
                      <input
                        id="confirm-pass"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        placeholder="Repeat your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={loading || password.length < 6 || password !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Saving Password...
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-footer">
                  <Link to="/login">← Return to Login</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

