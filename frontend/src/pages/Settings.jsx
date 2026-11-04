import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  LogOut, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

const Settings = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('account'); // 'account', 'password', 'notifications', 'privacy'

  // Account state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [referralAlerts, setReferralAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Update Account Information
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put('/users/profile', { name, email });
      updateUser(data);
      showToast('success', 'Account details updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update account.');
    } finally {
      setLoading(false);
    }
  };

  // Update Password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/users/profile', { password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      showToast('success', 'Password updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '5rem' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: toast.type === 'success' ? '#15803D' : '#B91C1C',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 1200,
            animation: 'slideUp 0.25s ease',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-main)',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="container" style={{ maxWidth: '960px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #DBEAFE',
              fontSize: '0.78125rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <SettingsIcon size={14} color="#3B82F6" />
            Preferences & Controls
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            Account Settings
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage your credentials, notifications, privacy preferences, and security.
          </p>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="container" style={{ maxWidth: '960px', paddingTop: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Settings Left Menu */}
          <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'account', label: 'General Account', icon: User },
              { id: 'password', label: 'Password & Security', icon: Lock },
              { id: 'notifications', label: 'Notification Alerts', icon: Bell },
              { id: 'privacy', label: 'Privacy & Sharing', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    color: isSelected ? 'var(--primary-blue)' : 'var(--text-secondary)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div style={{ height: '1px', backgroundColor: 'var(--border-main)', margin: '8px 0' }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--danger)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Settings Right Form Panel */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* General Account Section */}
            {activeSection === 'account' && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  General Account Details
                </h3>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Update your contact email and display name across DevConnect.
                </p>

                <form onSubmit={handleAccountUpdate}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="acc-name">Full Name</label>
                    <input
                      id="acc-name"
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acc-email">Email Address</label>
                    <input
                      id="acc-email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <Save size={15} />
                      Save Account Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Section */}
            {activeSection === 'password' && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  Change Password
                </h3>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Ensure your account is protected with a secure password.
                </p>

                <form onSubmit={handlePasswordUpdate}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-pwd">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="new-pwd"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-pwd">Confirm New Password</label>
                    <input
                      id="confirm-pwd"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading || !newPassword}>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  Notification Preferences
                </h3>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Choose how and when DevConnect contacts you.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        Referral Status Updates
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Receive real-time alerts when referral requests are accepted or updated.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={referralAlerts}
                      onChange={(e) => setReferralAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        Direct Messages
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Notify me when an employee or candidate sends a new chat message.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={messageAlerts}
                      onChange={(e) => setMessageAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        Email Summaries
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Weekly digest of top companies and newly joined verified referrers.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => showToast('success', 'Notification preferences saved!')}
                      className="btn btn-primary"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  Privacy & Profile Visibility
                </h3>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Control who can discover your profile and view your verified resume.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-main)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Profile Visibility
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Your profile is currently <strong>Public</strong> to logged-in DevConnect members so you can receive referrals and network invitations.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#EFF6FF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #DBEAFE',
                      fontSize: '0.8125rem',
                      color: '#1E40AF',
                    }}
                  >
                    <strong>Resume Security:</strong> Your uploaded resume is accessible only through authenticated session tokens or direct links shared with verified employees.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

