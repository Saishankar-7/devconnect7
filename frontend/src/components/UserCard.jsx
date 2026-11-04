import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from './ui/UserAvatar';
import { RoleBadge, SkillBadge } from './ui/Badge';
import ReferralModal from './ui/ReferralModal';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Star, 
  Send, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';

export const UserCard = ({ employee, hasRequested: initialHasRequested = false, index = 0 }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(initialHasRequested);
  const [justSent, setJustSent] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    setHasRequested(true);
    setJustSent(true);
    setTimeout(() => setJustSent(false), 4000);
  };

  const isReferrer = employee.role === 'employee';
  const isDevUser = user?.role === 'developer';
  const isSelf = user?._id === employee._id;

  return (
    <>
      <article
        className="card card-hover"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          animation: 'slideUp 0.32s var(--ease-out-expo) backwards',
          animationDelay: `${Math.min(index * 45, 450)}ms`,
        }}
      >
        {/* Success toast notification */}
        {justSent && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10,
              boxShadow: 'var(--shadow-sm)',
              animation: 'slideDown 0.2s ease',
            }}
          >
            <CheckCircle size={14} />
            <span>Referral request sent successfully!</span>
          </div>
        )}

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.875rem' }}>
          <Link to={`/profile/${employee._id}`}>
            <UserAvatar user={employee} size="md" showRoleDot={true} />
          </Link>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Link
                to={`/profile/${employee._id}`}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {employee.name}
              </Link>
            </div>

            {/* Sub-headline / Role */}
            <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <RoleBadge role={employee.role} company={employee.company} size="sm" />
              
              {isReferrer && employee.rating > 0 && (
                <span
                  title={`${employee.rating} points earned from referrals`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#B45309',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  <Star size={11} fill="#F59E0B" color="#F59E0B" />
                  <span>{employee.rating}</span>
                </span>
              )}
            </div>

            {employee.experience && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Briefcase size={12} />
                <span>{employee.experience}</span>
              </div>
            )}
          </div>
        </div>

        {/* Short Bio */}
        <p
          style={{
            fontSize: '0.84375rem',
            color: employee.bio ? 'var(--text-secondary)' : 'var(--text-subtle)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontStyle: employee.bio ? 'normal' : 'italic',
          }}
        >
          {employee.bio || 'No professional bio provided yet.'}
        </p>

        {/* Skills List */}
        {employee.skills && employee.skills.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginBottom: '1.125rem',
            }}
          >
            {employee.skills.slice(0, 4).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} />
            ))}
            {employee.skills.length > 4 && (
              <span
                style={{
                  fontSize: '0.71875rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  alignSelf: 'center',
                  fontWeight: 500,
                }}
              >
                +{employee.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Footers */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Request Referral Button (for developers viewing employees) */}
          {isDevUser && isReferrer && !isSelf && (
            <button
              onClick={() => !hasRequested && setShowModal(true)}
              disabled={hasRequested}
              className={`btn ${hasRequested ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              style={{
                width: '100%',
                fontWeight: 600,
                backgroundColor: hasRequested ? '#F0FDF4' : undefined,
                color: hasRequested ? '#15803D' : undefined,
                borderColor: hasRequested ? '#BBF7D0' : undefined,
              }}
            >
              {hasRequested ? (
                <>
                  <CheckCircle size={14} />
                  <span>Referral Requested</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Request Referral at {employee.company || 'Company'}</span>
                </>
              )}
            </button>
          )}

          {/* Icon Link Buttons Row */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Link
              to={`/profile/${employee._id}`}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
            >
              Profile
            </Link>

            {employee.resumeUrl && (
              <Link
                to={`/resume?url=${encodeURIComponent(employee.resumeUrl)}&name=${encodeURIComponent(employee.name)}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                title="View verified resume"
              >
                <FileText size={13} />
                <span>Resume</span>
              </Link>
            )}

            {!isSelf && (
              <Link
                to={`/chat/${employee._id}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                title="Message directly"
              >
                <MessageSquare size={13} />
                <span>Chat</span>
              </Link>
            )}
          </div>
        </div>
      </article>

      {/* Referral Modal Dialog */}
      {showModal && (
        <ReferralModal
          employee={employee}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default UserCard;
