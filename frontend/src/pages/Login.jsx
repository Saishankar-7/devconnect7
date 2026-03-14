import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const { login, error, user, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Shake animation re-trigger when a new error arrives
  useEffect(() => {
    if (error) {
      setShakeError(false);
      // force reflow so animation fires again on repeated errors
      requestAnimationFrame(() => setShakeError(true));
    }
  }, [error]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="login-page__blob login-page__blob--1" />
      <div className="login-page__blob login-page__blob--2" />

      <div className={`login-card${shakeError ? ' shake' : ''}`}>

        {/* Logo mark */}
        <div className="login-card__logo">
          <div className="login-card__logo-mark">⚡</div>
        </div>

        {/* Heading */}
        <h2 className="login-card__title">Welcome back</h2>
        <p className="login-card__subtitle">Sign in to your DevConnect account</p>

        {/* Error banner */}
        {error && (
          <div className="login-error" role="alert">
            <span className="login-error__icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={submitHandler} noValidate>

          {/* Email */}
          <div className="field">
            <label className="field__label" htmlFor="email">Email address</label>
            <div className="field__input-wrap">
              <span className="field__icon">✉️</span>
              <input
                id="email"
                type="email"
                className="field__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <div className="field__row">
              <label className="field__label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="field__forgot">Forgot password?</Link>
            </div>
            <div className="field__input-wrap">
              <span className="field__icon">🔒</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="field__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">or</div>

        {/* Footer */}
        <p className="login-card__footer">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
