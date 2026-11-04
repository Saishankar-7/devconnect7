import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge, SkillBadge } from '../components/ui/Badge';
import ReferralModal from '../components/ui/ReferralModal';
import { SkeletonUserCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { GithubIcon } from '../components/ui/BrandIcons';
import { 
  ArrowLeft, 
  MessageSquare, 
  FileText, 
  Send, 
  CheckCircle, 
  Building2, 
  Briefcase, 
  Globe, 
  Star, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [justRequested, setJustRequested] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await axios.get(`/users/${id}`);
      setProfileUser(data);

      // Check if developer user has already requested a referral from this employee
      if (currentUser?.role === 'developer' && data.role === 'employee') {
        try {
          const { data: refHistory } = await axios.get('/referrals/history');
          const alreadyRequested = refHistory.some(
            (r) => (r.referrer?._id || r.referrer) === data._id
          );
          setHasRequested(alreadyRequested);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id === currentUser._id) {
      navigate('/profile');
      return;
    }
    fetchProfile();
  }, [id, currentUser, navigate, fetchProfile]);

  const handleReferralSuccess = () => {
    setShowModal(false);
    setHasRequested(true);
    setJustRequested(true);
    setTimeout(() => setJustRequested(false), 4000);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="shimmer-box" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          <div className="shimmer-box" style={{ height: '220px', borderRadius: 'var(--radius-lg)' }} />
          <div className="shimmer-box" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="container" style={{ paddingTop: '4rem', maxWidth: '600px', textAlign: 'center' }}>
        <EmptyState
          type="users"
          title="User profile not found"
          description="The professional profile you are looking for does not exist or may have been deleted."
          actionLabel="Browse Discover Network"
          actionTo="/discover"
        />
      </div>
    );
  }

  const isEmployee = profileUser.role === 'employee';
  const canRequestReferral = currentUser?.role === 'developer' && isEmployee;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '5rem' }}>
      {/* Cover Banner */}
      <div
        style={{
          height: '180px',
          background: 'linear-gradient(135deg, #172554 0%, #1E3A8A 50%, #3B82F6 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container" style={{ maxWidth: '840px', marginTop: '-70px', position: 'relative', zIndex: 10 }}>
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
        >
          <ArrowLeft size={14} />
          Back to previous
        </button>

        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
          }}
        >
          {justRequested && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#15803D',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84375rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={16} />
              Referral request submitted successfully!
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            {/* Avatar & Identifiers */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <UserAvatar user={profileUser} size="xl" showRoleDot={true} />
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {profileUser.name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <RoleBadge role={profileUser.role} company={profileUser.company} size="sm" />
                  {isEmployee && profileUser.rating > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#B45309',
                        backgroundColor: '#FFFBEB',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: '1px solid #FDE68A',
                      }}
                    >
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {profileUser.rating} Points
                    </span>
                  )}
                </div>

                {profileUser.experience && (
                  <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} />
                    <span>{profileUser.experience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link to={`/chat/${profileUser._id}`} className="btn btn-primary btn-sm">
                <MessageSquare size={15} />
                Send Message
              </Link>

              {canRequestReferral && (
                <button
                  onClick={() => !hasRequested && setShowModal(true)}
                  disabled={hasRequested}
                  className={`btn ${hasRequested ? 'btn-secondary' : 'btn-gradient'} btn-sm`}
                >
                  {hasRequested ? (
                    <>
                      <CheckCircle size={14} />
                      Referral Requested
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Request Referral @ {profileUser.company}
                    </>
                  )}
                </button>
              )}

              {profileUser.resumeUrl && (
                <Link
                  to={`/resume?url=${encodeURIComponent(profileUser.resumeUrl)}&name=${encodeURIComponent(profileUser.name)}`}
                  className="btn btn-outline btn-sm"
                >
                  <FileText size={15} />
                  Resume
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* About section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              About
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {profileUser.bio || 'This member has not written a personal introduction yet.'}
            </p>
          </div>

          {/* Company & Professional Background */}
          {profileUser.company && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Professional Role & Company
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {profileUser.company}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {profileUser.experience || (isEmployee ? 'Working Professional' : 'Target Company')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills Badges */}
          {profileUser.skills && profileUser.skills.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                Skills & Technologies
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profileUser.skills.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Social Links & Portfolio */}
          {(profileUser.githubUrl || profileUser.portfolioUrl) && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                Links & Portfolios
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {profileUser.githubUrl && (
                  <a
                    href={profileUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <GithubIcon size={15} />
                    GitHub
                    <ExternalLink size={12} color="var(--text-muted)" />
                  </a>
                )}
                {profileUser.portfolioUrl && (
                  <a
                    href={profileUser.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Globe size={15} />
                    Portfolio
                    <ExternalLink size={12} color="var(--text-muted)" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Modal Dialog */}
      {showModal && (
        <ReferralModal
          employee={profileUser}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleReferralSuccess}
        />
      )}
    </div>
  );
};

export default UserProfile;
