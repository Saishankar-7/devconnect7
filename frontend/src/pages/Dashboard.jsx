import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Star, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch referrals history
      const { data: refData } = await axios.get('/referrals/history');
      setReferrals(refData);

      // Fetch recommended professionals
      const { data: discUsers } = await axios.get('/users/discover');
      // Pick top 3-4 recommended matching the opposite role
      const targetRole = user?.role === 'developer' ? 'employee' : 'developer';
      const filtered = discUsers.filter((u) => u.role === targetRole || !u.role);
      setRecommendedUsers(filtered.slice(0, 4));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [authLoading, user, navigate, fetchDashboardData]);

  // Handle Accept / Reject referrals (for employees)
  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const endpoint = status === 'accepted' ? `/referrals/${id}/accept` : `/referrals/${id}/reject`;
      const { data } = await axios.put(endpoint);

      // Update in state
      setReferrals((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );

      // If accepted, update rating in AuthContext
      if (status === 'accepted' && data.newRating !== undefined) {
        updateUser({ rating: data.newRating });
      }
    } catch (err) {
      console.error('Error updating referral:', err);
      alert('Could not update referral status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div className="spinner spinner-primary" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const isDev = user.role === 'developer';

  // Calculate profile completion score
  const profileChecks = [
    { label: 'Full Name', done: !!user.name },
    { label: 'Professional Bio', done: !!user.bio },
    { label: 'Profile Photo', done: !!user.avatarUrl },
    { label: isDev ? 'Skills Listed' : 'Company Info', done: isDev ? user.skills?.length > 0 : !!user.company },
    { label: isDev ? 'Resume Attached' : 'Years Experience', done: isDev ? !!user.resumeUrl : !!user.experience },
    { label: isDev ? 'GitHub / Portfolio' : 'Contact Links', done: isDev ? (!!user.githubUrl || !!user.portfolioUrl) : true },
  ];
  const completedCount = profileChecks.filter((c) => c.done).length;
  const completionPercentage = Math.round((completedCount / profileChecks.length) * 100);

  // Referral Stats
  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    accepted: referrals.filter((r) => r.status === 'accepted').length,
    rejected: referrals.filter((r) => r.status === 'rejected').length,
  };

  const displayedReferrals = activeTab === 'all'
    ? referrals
    : referrals.filter((r) => r.status === activeTab);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '4rem' }}>
      {/* Dashboard Top Header */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-main)',
          paddingTop: '2rem',
          paddingBottom: '2rem',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            {/* User Greeting & Headline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <UserAvatar user={user} size="lg" showRoleDot={true} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getGreeting()}, {user.name.split(' ')[0]}
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 6px' }}>
                  Overview & Opportunities
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <RoleBadge role={user.role} company={user.company} size="sm" />
                  {!isDev && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
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
                      {user.rating || 0} Referral Points
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn btn-secondary btn-sm">
                Edit Profile
              </Link>
              {isDev ? (
                <Link to="/discover" className="btn btn-primary btn-sm">
                  <Compass size={15} />
                  Find Referrers
                </Link>
              ) : (
                <Link to="/network" className="btn btn-primary btn-sm">
                  <Users size={15} />
                  Browse Network
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Metric Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Card 1: Total Referrals */}
          <div
            className="card card-hover"
            style={{
              padding: '1.25rem',
              animation: 'slideUp 0.3s var(--ease-out-expo) backwards',
              animationDelay: '40ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {isDev ? 'Total Requests Sent' : 'Total Requests Received'}
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                <Briefcase size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {counts.all}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isDev ? 'Referral requests tracked' : 'Applications to review'}
            </div>
          </div>

          {/* Card 2: Pending */}
          <div
            className="card card-hover"
            style={{
              padding: '1.25rem',
              animation: 'slideUp 0.3s var(--ease-out-expo) backwards',
              animationDelay: '100ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Pending Review
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309' }}>
              {counts.pending}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Awaiting response
            </div>
          </div>

          {/* Card 3: Accepted */}
          <div
            className="card card-hover"
            style={{
              padding: '1.25rem',
              animation: 'slideUp 0.3s var(--ease-out-expo) backwards',
              animationDelay: '160ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {isDev ? 'Referrals Accepted' : 'Referrals Given'}
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D' }}>
              {counts.accepted}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Successfully referred
            </div>
          </div>

          {/* Card 4: Connections & Rating */}
          <div
            className="card card-hover"
            style={{
              padding: '1.25rem',
              animation: 'slideUp 0.3s var(--ease-out-expo) backwards',
              animationDelay: '220ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {isDev ? 'Application Success Rate' : 'Referral Impact Points'}
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--violet-600)' }}>
              {isDev
                ? (counts.all > 0 ? `${Math.round((counts.accepted / counts.all) * 100)}%` : '—')
                : (user.rating || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isDev ? 'Referral conversion rate' : 'Points earned helping others'}
            </div>
          </div>
        </div>

        {/* 2-Column Section: Left = Referrals List, Right = Profile Completion & Recommendations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
            alignItems: 'start',
          }}
        >
          {/* LEFT: Referral Management Tracker */}
          <div style={{ gridColumn: 'span 2' }}>
            <div
              className="card"
              style={{
                padding: '1.5rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Tracker Head */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-main)',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {isDev ? 'Active Referral Requests' : 'Incoming Referral Applications'}
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {isDev ? 'Track the status of your employee referral submissions' : 'Review developer profiles and grant internal company referrals'}
                  </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-muted)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
                  {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                        color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: activeTab === tab ? 'var(--shadow-xs)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab} ({counts[tab]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Referrals Content */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : referrals.length === 0 ? (
                <EmptyState
                  type="inbox"
                  title={isDev ? 'No referral requests yet' : 'No incoming requests to review'}
                  description={
                    isDev
                      ? 'Browse verified software engineers at top companies and request your first employee referral.'
                      : 'Developers will appear here when they request referrals for your company.'
                  }
                  actionLabel={isDev ? 'Explore Tech Referrers' : undefined}
                  actionTo={isDev ? '/discover' : undefined}
                />
              ) : displayedReferrals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No {activeTab} referrals found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayedReferrals.map((refItem) => {
                    const counterpart = isDev ? refItem.referrer : refItem.requester;
                    const counterpartId = counterpart?._id;
                    const isPending = refItem.status === 'pending';

                    return (
                      <div
                        key={refItem._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          padding: '1.125rem',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-main)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'all var(--transition-fast)',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Left Counterpart Details */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
                          <UserAvatar user={counterpart} size="md" />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                                {refItem.company || 'Company'}
                              </h4>
                              <StatusBadge status={refItem.status} size="sm" />
                            </div>

                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '3px 0 6px' }}>
                              {isDev ? 'Referred by' : 'Applicant'}:{' '}
                              <Link
                                to={`/profile/${counterpartId}`}
                                style={{ fontWeight: 600, color: 'var(--primary-blue)' }}
                              >
                                {counterpart?.name || 'User'}
                              </Link>
                              {counterpart?.email && <span> · {counterpart.email}</span>}
                            </p>

                            {/* Referral message note */}
                            {refItem.message && (
                              <p
                                style={{
                                  fontSize: '0.8125rem',
                                  color: 'var(--text-muted)',
                                  backgroundColor: 'var(--bg-muted)',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  margin: '6px 0',
                                  lineHeight: 1.45,
                                  fontStyle: 'italic',
                                }}
                              >
                                "{refItem.message}"
                              </p>
                            )}

                            {/* Job link if present */}
                            {refItem.jobUrl && (
                              <div style={{ marginTop: '4px' }}>
                                <a
                                  href={refItem.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--primary-blue)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <span>View Job Posting</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}

                            {/* For employees: Applicant's Resume button & Skills */}
                            {!isDev && counterpart?.resumeUrl && (
                              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                <Link
                                  to={`/resume?url=${encodeURIComponent(counterpart.resumeUrl)}&name=${encodeURIComponent(counterpart.name)}`}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                >
                                  <FileText size={12} />
                                  View Candidate Resume
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Accept / Reject actions for employees */}
                          {!isDev && isPending && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(refItem._id, 'accepted')}
                                disabled={updatingId === refItem._id}
                                className="btn btn-primary btn-sm"
                                style={{ backgroundColor: '#16A34A' }}
                              >
                                {updatingId === refItem._id ? 'Updating...' : 'Accept Referral'}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(refItem._id, 'rejected')}
                                disabled={updatingId === refItem._id}
                                className="btn btn-danger btn-sm"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {counterpartId && (
                            <Link
                              to={`/chat/${counterpartId}`}
                              className="btn btn-secondary btn-sm"
                              title="Open Direct Message"
                            >
                              <MessageSquare size={14} />
                              Chat
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Profile Completion & Recommended Professionals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Profile Completion Indicator */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                  Profile Completion
                </h3>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                  {completionPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: `${completionPercentage}%`,
                    height: '100%',
                    backgroundColor: completionPercentage === 100 ? '#16A34A' : '#3B82F6',
                    borderRadius: '9999px',
                    transition: 'width 0.8s var(--ease-out-expo)',
                  }}
                />
              </div>

              {/* Actionable checklists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profileChecks.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78125rem',
                      color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2
                        size={14}
                        color={item.done ? '#16A34A' : '#CBD5E1'}
                      />
                      <span style={{ textDecoration: item.done ? 'none' : 'none' }}>
                        {item.label}
                      </span>
                    </span>
                    {!item.done && (
                      <Link
                        to="/profile"
                        style={{ color: 'var(--primary-blue)', fontWeight: 600, fontSize: '0.75rem' }}
                      >
                        Add +
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {completionPercentage < 100 && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-main)' }}>
                  <Link
                    to="/profile"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', fontSize: '0.78125rem' }}
                  >
                    Complete Your Profile →
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Professionals Showcase */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                    {isDev ? 'Featured Referrers' : 'Talented Candidates'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isDev ? 'Top companies hiring now' : 'Developers looking for referrals'}
                  </span>
                </div>
                <Link
                  to="/discover"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-blue)' }}
                >
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendedUsers.slice(0, 3).map((recUser) => (
                  <div
                    key={recUser._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <UserAvatar user={recUser} size="xs" />
                      <div style={{ minWidth: 0 }}>
                        <Link
                          to={`/profile/${recUser._id}`}
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {recUser.name}
                        </Link>
                        <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                          {recUser.company || (recUser.skills?.[0] ? `${recUser.skills[0]} Dev` : 'Developer')}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/profile/${recUser._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.71875rem' }}
                    >
                      Connect
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Trust & Safety Note */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78125rem',
                color: '#1E40AF',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                <ShieldCheck size={16} color="#3B82F6" />
                <span>DevConnect Quality Guarantee</span>
              </div>
              All referrals are reviewed directly by working employees. Resumes sent are strictly confidential and shared only with your chosen contact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
