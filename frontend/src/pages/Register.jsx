import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, error, user, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const { name, email, password, role, company } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') evaluatePasswordStrength(value);
  };

  const evaluatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordStrength(score);
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { label: '', color: 'transparent' };
    if (passwordStrength <= 1) return { label: 'Weak', color: '#ef4444' };
    if (passwordStrength <= 3) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Strong', color: '#22c55e' };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData);
    setIsSubmitting(false);
    if (success) navigate('/dashboard');
  };

  const strength = getStrengthLabel();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .reg-root {
          --reg-bg: #070c18;
          --reg-surface: #0f172a;
          --reg-surface-2: #1e293b;
          --reg-border: rgba(99, 179, 237, 0.1);
          --reg-border-focus: rgba(56, 189, 248, 0.45);
          --reg-accent: #38bdf8;
          --reg-accent-2: #818cf8;
          --reg-gradient: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          --reg-glow: rgba(56, 189, 248, 0.12);
          --reg-text-1: #f1f5f9;
          --reg-text-2: #94a3b8;
          --reg-text-3: #64748b;
          --reg-danger: #ef4444;
          --reg-danger-bg: rgba(239, 68, 68, 0.08);
          font-family: 'DM Sans', sans-serif;
          min-height: calc(100vh - 140px);
          background-color: var(--reg-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.25rem;
          position: relative;
          overflow: hidden;
        }

        /* Background decoration */
        .reg-root::before {
          content: '';
          position: fixed;
          top: -30%;
          right: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 65%);
          pointer-events: none;
        }
        .reg-root::after {
          content: '';
          position: fixed;
          bottom: -20%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Card */
        .reg-card {
          width: 100%;
          max-width: 480px;
          background: var(--reg-surface);
          border: 1px solid var(--reg-border);
          border-radius: 20px;
          padding: 2.5rem;
          position: relative;
          z-index: 1;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }

        /* Header */
        .reg-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .reg-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--reg-text-1);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1.25rem;
          letter-spacing: -0.3px;
        }

        .reg-logo span {
          background: var(--reg-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .reg-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.7rem;
          font-weight: 700;
          color: var(--reg-text-1);
          margin: 0 0 0.4rem;
          letter-spacing: -0.4px;
        }

        .reg-subtitle {
          font-size: 0.9rem;
          color: var(--reg-text-3);
          margin: 0;
        }

        /* Error */
        .reg-error {
          background: var(--reg-danger-bg);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: var(--reg-danger);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Role Toggle */
        .reg-role-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .reg-role-btn {
          position: relative;
          border: 1.5px solid var(--reg-border);
          border-radius: 12px;
          background: transparent;
          padding: 14px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--reg-text-3);
        }

        .reg-role-btn--active {
          border-color: var(--reg-accent);
          background: var(--reg-glow);
          color: var(--reg-accent);
        }

        .reg-role-btn:hover:not(.reg-role-btn--active) {
          border-color: rgba(99, 179, 237, 0.25);
          background: rgba(255,255,255,0.02);
          color: var(--reg-text-2);
        }

        .reg-role-icon {
          font-size: 1.3rem;
          line-height: 1;
        }

        .reg-role-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .reg-role-desc {
          font-size: 0.72rem;
          line-height: 1.3;
          opacity: 0.8;
        }

        .reg-role-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--reg-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.2s ease;
        }

        .reg-role-btn--active .reg-role-check {
          opacity: 1;
          transform: scale(1);
        }

        /* Divider */
        .reg-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .reg-divider-line {
          flex: 1;
          height: 1px;
          background: var(--reg-border);
        }

        .reg-divider-text {
          font-size: 0.75rem;
          color: var(--reg-text-3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Input groups */
        .reg-field {
          margin-bottom: 1.1rem;
        }

        .reg-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--reg-text-2);
          margin-bottom: 7px;
          letter-spacing: 0.03em;
        }

        .reg-input-wrap {
          position: relative;
        }

        .reg-input {
          width: 100%;
          background: var(--reg-surface-2);
          border: 1.5px solid var(--reg-border);
          border-radius: 10px;
          padding: 11px 14px;
          color: var(--reg-text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .reg-input::placeholder {
          color: var(--reg-text-3);
        }

        .reg-input:focus {
          border-color: var(--reg-border-focus);
          box-shadow: 0 0 0 3px var(--reg-glow);
        }

        .reg-input--with-icon {
          padding-right: 44px;
        }

        .reg-input-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--reg-text-3);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .reg-input-icon-btn:hover {
          color: var(--reg-text-2);
        }

        /* Password strength */
        .reg-pwd-strength {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reg-pwd-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .reg-pwd-bar {
          height: 3px;
          flex: 1;
          border-radius: 100px;
          background: var(--reg-surface-2);
          transition: background 0.3s ease;
        }

        .reg-pwd-label {
          font-size: 0.72rem;
          font-weight: 600;
          min-width: 38px;
          text-align: right;
        }

        /* Slide-in animation for company field */
        .reg-slide-in {
          animation: regSlideIn 0.25s ease forwards;
        }

        @keyframes regSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Submit button */
        .reg-submit {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: var(--reg-gradient);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .reg-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .reg-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reg-submit__spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: regSpin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes regSpin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .reg-footer-text {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.875rem;
          color: var(--reg-text-3);
        }

        .reg-footer-text a {
          color: var(--reg-accent);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .reg-footer-text a:hover {
          opacity: 0.8;
        }

        .reg-terms {
          text-align: center;
          font-size: 0.75rem;
          color: var(--reg-text-3);
          margin-top: 1rem;
          line-height: 1.6;
        }

        .reg-terms a {
          color: var(--reg-text-2);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        @media (max-width: 520px) {
          .reg-card {
            padding: 1.75rem 1.25rem;
          }
          .reg-title {
            font-size: 1.45rem;
          }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-card">

          {/* Header */}
          <div className="reg-header">
            <Link to="/" className="reg-logo">Dev<span>Connect</span></Link>
            <h1 className="reg-title">Create your account</h1>
            <p className="reg-subtitle">Join thousands of devs and referrers</p>
          </div>

          {/* Error */}
          {error && (
            <div className="reg-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} noValidate>

            {/* Role Toggle */}
            <div className="reg-role-toggle" role="group" aria-label="Select your role">
              <button
                type="button"
                className={`reg-role-btn ${role === 'developer' ? 'reg-role-btn--active' : ''}`}
                onClick={() => onChange({ target: { name: 'role', value: 'developer' } })}
              >
                <span className="reg-role-check">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="reg-role-icon">💻</span>
                <span className="reg-role-label">Job Seeker</span>
                <span className="reg-role-desc">Looking for a referral</span>
              </button>
              <button
                type="button"
                className={`reg-role-btn ${role === 'employee' ? 'reg-role-btn--active' : ''}`}
                onClick={() => onChange({ target: { name: 'role', value: 'employee' } })}
              >
                <span className="reg-role-check">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="reg-role-icon">🏢</span>
                <span className="reg-role-label">Referrer</span>
                <span className="reg-role-desc">I can refer candidates</span>
              </button>
            </div>

            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">Your details</span>
              <div className="reg-divider-line" />
            </div>

            {/* Full Name */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="reg-input"
                placeholder="John Doe"
                value={name}
                onChange={onChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="reg-input"
                placeholder="you@example.com"
                value={email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Company (conditional) */}
            {role === 'employee' && (
              <div className="reg-field reg-slide-in">
                <label className="reg-label" htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="reg-input"
                  placeholder="Google, Amazon, Meta…"
                  value={company}
                  onChange={onChange}
                  required
                  autoComplete="organization"
                />
              </div>
            )}

            {/* Password */}
            <div className="reg-field">
              <label className="reg-label" htmlFor="password">Password</label>
              <div className="reg-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="reg-input reg-input--with-icon"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={onChange}
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="reg-input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="reg-pwd-strength">
                  <div className="reg-pwd-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="reg-pwd-bar"
                        style={{ background: i <= passwordStrength ? strength.color : undefined }}
                      />
                    ))}
                  </div>
                  <span className="reg-pwd-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="reg-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className="reg-submit__spinner" />Creating account…</>
              ) : (
                `Join as ${role === 'developer' ? 'Job Seeker' : 'Referrer'} →`
              )}
            </button>
          </form>

          <p className="reg-footer-text">
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>

          <p className="reg-terms">
            By registering, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
