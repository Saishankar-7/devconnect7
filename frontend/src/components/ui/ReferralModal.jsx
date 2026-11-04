import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import UserAvatar from './UserAvatar';
import { Send, AlertCircle, Sparkles, Link2, Check } from 'lucide-react';

export const ReferralModal = ({ employee, isOpen = true, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await axios.post('/referrals/request', {
        referrerId: employee._id,
        company: employee.company,
        jobUrl: jobUrl.trim() || undefined,
        message: message.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit referral request. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? 'Request Confirmed' : 'Request an Employee Referral'}
      subtitle={isSuccess ? '' : `Referral to ${employee?.company || 'Company'} via ${employee?.name}`}
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', animation: 'scaleIn 0.25s var(--ease-out-expo)' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#F0FDF4',
              border: '2px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#16A34A',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.15)',
              animation: 'badgePop 0.35s var(--ease-spring)',
            }}
          >
            <Check size={30} strokeWidth={2.5} />
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Referral Request Delivered!
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Your referral note has been sent to <strong>{employee?.name}</strong> at <strong>{employee?.company}</strong>. Track its milestones anytime in your Referral Tracker.
          </p>
          <button
            onClick={() => {
              if (onSuccess) onSuccess();
              if (onClose) onClose();
            }}
            className="btn btn-primary btn-sm"
          >
            Got it
          </button>
        </div>
      ) : (
        <>
          {/* Target Employee Info Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-main)',
              marginBottom: '1.25rem',
            }}
          >
            <UserAvatar user={employee} size="sm" showRoleDot={true} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {employee?.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 500 }}>
                {employee?.company}
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                color: '#B91C1C',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Optional Job URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="ref-job-url">
                <span>Target Job Link or Requisition ID</span>
                <span className="form-hint">Optional</span>
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
                  <Link2 size={16} />
                </span>
                <input
                  id="ref-job-url"
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="https://careers.company.com/job/12345"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Personalized Message */}
            <div className="form-group">
              <label className="form-label" htmlFor="ref-message">
                <span>Personal Introduction & Why You're a Fit</span>
                <span className="form-hint" style={{ color: message.length >= 300 ? '#EF4444' : undefined }}>
                  {message.length} / 300
                </span>
              </label>
              <textarea
                id="ref-message"
                className="form-textarea"
                rows={4}
                placeholder="Hi! I have 3+ years of experience with React and TypeScript. I recently built high-scale frontend systems and would love the opportunity to be referred for the Software Engineer role..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                required
                autoFocus
              />
            </div>

            {/* Pro Tip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: '#EFF6FF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #DBEAFE',
                fontSize: '0.8125rem',
                color: '#1E40AF',
                marginBottom: '1.5rem',
                lineHeight: 1.45,
              }}
            >
              <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#3B82F6' }} />
              <span>
                <strong>Referral Tip:</strong> Keep it concise. Mention your relevant stack, top project or achievement, and why you are excited about this specific company.
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !message.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Referral Request
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};

export default ReferralModal;
