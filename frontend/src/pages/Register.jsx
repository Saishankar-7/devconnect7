import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Code2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import './Login.css';

const Register = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'referrer' ? 'employee' : 'developer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    company: '',
    skills: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { user, register, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [clearError, user, navigate]);

  const { name, email, password, role, company, skills } = formData;

  const handleChange = (e) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (fieldName === 'password') {
      let score = 0;
      if (value.length >= 6) score++;
      if (value.length >= 10) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setPasswordStrength(score);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    const skillsArray = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const success = await register({
      ...formData,
      skills: skillsArray,
    });
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const getStrengthMeta = () => {
    if (passwordStrength === 0) return { label: '', color: 'transparent', width: '0%' };
    if (passwordStrength <= 1) return { label: 'Weak', color: '#EF4444', width: '25%' };
    if (passwordStrength <= 3) return { label: 'Fair', color: '#F59E0B', width: '60%' };
    return { label: 'Strong', color: '#16A34A', width: '100%' };
  };

  const strengthMeta = getStrengthMeta();

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
              Join thousands of developers leveling up their careers.
            </h2>
            <p className="auth-brand-sub">
              Create your profile to unlock internal employee referrals, connect with engineers at top companies, and fast-track your applications.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                'Direct referrals skip the ATS automatic resume filter',
                'Verified working professionals from Google, Stripe, Meta & Amazon',
                'End-to-end referral milestone & interview progress tracking',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60A5FA',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#E2E8F0' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94A3B8' }}>
            <ShieldCheck size={16} color="#3B82F6" />
            <span>Strict privacy: your resume is only shared with approved referrers.</span>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="auth-form-side">
          <div className="auth-card-inner" style={{ maxWidth: '440px' }}>
            <div className="auth-header">
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Get started with DevConnect for free</p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Role Toggle Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '6px' }}>I want to join as a:</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'developer' }))}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${role === 'developer' ? 'var(--primary-blue)' : 'var(--border-main)'}`,
                      backgroundColor: role === 'developer' ? '#EFF6FF' : '#FFFFFF',
                      color: role === 'developer' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Code2 size={20} />
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Job Seeker</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Looking for referrals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'employee' }))}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${role === 'employee' ? '#16A34A' : 'var(--border-main)'}`,
                      backgroundColor: role === 'employee' ? '#F0FDF4' : '#FFFFFF',
                      color: role === 'employee' ? '#15803D' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Building2 size={20} />
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Referrer</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Tech company employee</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                    <User size={16} />
                  </span>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Work or Personal Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="alex@example.com"
                    value={email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Company (if employee) */}
              {role === 'employee' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-company">Current Company</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                      <Building2 size={16} />
                    </span>
                    <input
                      id="reg-company"
                      name="company"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="e.g. Google, Stripe, Microsoft"
                      value={company}
                      onChange={handleChange}
                      required={role === 'employee'}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '40px' }}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', backgroundColor: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: strengthMeta.width,
                          backgroundColor: strengthMeta.color,
                          transition: 'width 0.25s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginTop: '3px', color: 'var(--text-muted)' }}>
                      <span>Password strength:</span>
                      <span style={{ fontWeight: 600, color: strengthMeta.color }}>{strengthMeta.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading || !name || !email || !password}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
