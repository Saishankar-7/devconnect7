import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [clearError, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      const redirectPath = location.state?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side: Brand Story */}
        <div className="auth-brand-side">
          <div>
            <Logo size="lg" to="/" />
          </div>

          <div className="auth-brand-content">
            <h2 className="auth-brand-heading">
              Your direct bridge to top engineering referrals.
            </h2>
            <p className="auth-brand-sub">
              Sign in to connect with verified referrers at Google, Microsoft, Stripe, and Meta. Track your referrals in real-time.
            </p>

            <div className="auth-stats-grid">
              <div>
                <div className="auth-stat-item__num">4,200+</div>
                <div className="auth-stat-item__label">Developers Referred</div>
              </div>
              <div>
                <div className="auth-stat-item__num">320+</div>
                <div className="auth-stat-item__label">Partner Tech Companies</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94A3B8' }}>
            <ShieldCheck size={16} color="#3B82F6" />
            <span>Secure 256-bit encryption · Official verified employees</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-side">
          <div className="auth-card-inner">
            <div className="auth-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your DevConnect account</p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                      display: 'flex',
                    }}
                  >
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="password">Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.78125rem', color: 'var(--primary-blue)', fontWeight: 500 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                      display: 'flex',
                    }}
                  >
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '40px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account yet?{' '}
              <Link to="/register">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
