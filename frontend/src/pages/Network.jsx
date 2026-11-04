import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow, SkeletonUserCard } from '../components/ui/Skeleton';
import { 
  Users, 
  UserCheck, 
  Send, 
  Inbox, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  XCircle,
  Building2,
  ExternalLink,
  Search
} from 'lucide-react';

const Network = () => {
  const { user, loading: authLoading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('connections'); // 'connections', 'incoming', 'sent', 'suggested'
  const [referrals, setReferrals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchNetworkData = useCallback(async () => {
    try {
      setLoading(true);
      const [refRes, userRes] = await Promise.all([
        axios.get('/referrals/history'),
        axios.get('/users'),
      ]);
      setReferrals(refRes.data);
      // Exclude self from suggested members
      setAllUsers(userRes.data.filter((u) => u._id !== user?._id));
    } catch (err) {
      console.error('Network data fetch error:', err);
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
    fetchNetworkData();
  }, [authLoading, user, navigate, fetchNetworkData]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const endpoint = status === 'accepted' ? `/referrals/${id}/accept` : `/referrals/${id}/reject`;
      const { data } = await axios.put(endpoint);

      setReferrals((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );

      if (status === 'accepted' && data.newRating !== undefined) {
        updateUser({ rating: data.newRating });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const isDev = user.role === 'developer';

  // Derived connection lists
  const acceptedReferrals = referrals.filter((r) => r.status === 'accepted');
  const incomingRequests = isDev ? [] : referrals.filter((r) => r.status === 'pending');
  const sentRequests = isDev ? referrals.filter((r) => r.status === 'pending') : [];

  // Filtered connections
  const filteredConnections = acceptedReferrals.filter((r) => {
    const person = isDev ? r.referrer : r.requester;
    if (!searchQuery) return true;
    return person?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.company?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Suggested connections: users not yet connected with
  const connectedIds = new Set(
    referrals.map((r) => (isDev ? r.referrer?._id || r.referrer : r.requester?._id || r.requester))
  );
  const suggestedMembers = allUsers
    .filter((u) => !connectedIds.has(u._id))
    .slice(0, 8);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '4rem' }}>
      {/* Network Header */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-main)',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
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
                marginBottom: '1rem',
              }}
            >
              <Users size={14} color="#3B82F6" />
              Professional Networking Hub
            </span>

            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: '0.5rem',
              }}
            >
              My Network & Connections
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
              Manage your professional relationships, accepted referral partners, and pending requests.
            </p>

            {/* Navigation Tabs Bar */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-main)',
                flexWrap: 'wrap',
                gap: '4px',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => setActiveTab('connections')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84375rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'connections' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'connections' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'connections' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <UserCheck size={15} />
                <span>My Connections ({acceptedReferrals.length})</span>
              </button>

              {!isDev && (
                <button
                  onClick={() => setActiveTab('incoming')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    backgroundColor: activeTab === 'incoming' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'incoming' ? '#15803D' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'incoming' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Inbox size={15} />
                  <span>Incoming Requests ({incomingRequests.length})</span>
                </button>
              )}

              {isDev && (
                <button
                  onClick={() => setActiveTab('sent')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    backgroundColor: activeTab === 'sent' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'sent' ? '#B45309' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'sent' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={15} />
                  <span>Sent Requests ({sentRequests.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('suggested')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84375rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'suggested' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'suggested' ? 'var(--violet-600)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'suggested' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={15} />
                <span>Suggested Members ({suggestedMembers.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Views */}
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Tab 1: My Connections */}
        {activeTab === 'connections' && (
          <div>
            {/* Search Filter inside connections */}
            {acceptedReferrals.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  maxWidth: '380px',
                  marginBottom: '1.5rem',
                }}
              >
                <Search size={16} color="var(--text-subtle)" />
                <input
                  type="text"
                  placeholder="Filter connections by name or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    width: '100%',
                  }}
                />
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : filteredConnections.length === 0 ? (
              <EmptyState
                type="users"
                title="No active connections yet"
                description={
                  isDev
                    ? 'When an employee accepts your referral request, they will appear here as a verified connection.'
                    : 'When you accept candidate referral requests, they become part of your professional network.'
                }
                actionLabel="Explore Professionals to Connect"
                actionTo="/discover"
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {filteredConnections.map((item) => {
                  const counterpart = isDev ? item.referrer : item.requester;
                  return (
                    <div
                      key={item._id}
                      className="card card-hover"
                      style={{ padding: '1.25rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <UserAvatar user={counterpart} size="md" showRoleDot={true} />
                        <div>
                          <Link
                            to={`/profile/${counterpart?._id}`}
                            style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}
                          >
                            {counterpart?.name}
                          </Link>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 500 }}>
                            {item.company}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Connected via Referral in <strong>{item.company}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/chat/${counterpart?._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <MessageSquare size={14} />
                          Message
                        </Link>
                        <Link
                          to={`/profile/${counterpart?._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests (Employees) */}
        {activeTab === 'incoming' && (
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : incomingRequests.length === 0 ? (
              <EmptyState
                type="inbox"
                title="No pending requests to review"
                description="When job seekers request referrals at your company, they will be listed here for your review."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingRequests.map((item) => (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <UserAvatar user={item.requester} size="md" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                            {item.requester?.name}
                          </h4>
                          <StatusBadge status="pending" size="sm" />
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                          Target Company: <strong>{item.company}</strong> · {item.requester?.email}
                        </div>
                        {item.message && (
                          <div
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'var(--bg-muted)',
                              borderRadius: '6px',
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                              margin: '8px 0',
                              fontStyle: 'italic',
                            }}
                          >
                            "{item.message}"
                          </div>
                        )}
                        {item.requester?.resumeUrl && (
                          <Link
                            to={`/resume?url=${encodeURIComponent(item.requester.resumeUrl)}&name=${encodeURIComponent(item.requester.name)}`}
                            className="btn btn-outline btn-sm"
                            style={{ marginTop: '4px' }}
                          >
                            <FileText size={13} />
                            View Applicant Resume
                          </Link>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleUpdateStatus(item._id, 'accepted')}
                        disabled={updatingId === item._id}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#16A34A' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item._id, 'rejected')}
                        disabled={updatingId === item._id}
                        className="btn btn-danger btn-sm"
                      >
                        Decline
                      </button>
                      <Link to={`/chat/${item.requester?._id}`} className="btn btn-secondary btn-sm">
                        <MessageSquare size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sent Requests (Job Seekers) */}
        {activeTab === 'sent' && (
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : sentRequests.length === 0 ? (
              <EmptyState
                type="inbox"
                title="No pending requests sent"
                description="Explore verified tech employees and request an employee referral for your target company."
                actionLabel="Explore Referrers"
                actionTo="/discover"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sentRequests.map((item) => (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserAvatar user={item.referrer} size="md" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                            {item.company}
                          </h4>
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Referrer: <strong>{item.referrer?.name}</strong> ({item.referrer?.email})
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/chat/${item.referrer?._id}`} className="btn btn-secondary btn-sm">
                        <MessageSquare size={14} />
                        Chat
                      </Link>
                      <Link to={`/profile/${item.referrer?._id}`} className="btn btn-outline btn-sm">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Suggested Connections */}
        {activeTab === 'suggested' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {suggestedMembers.map((sUser) => (
                <div
                  key={sUser._id}
                  className="card card-hover"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                      <UserAvatar user={sUser} size="md" />
                      <div>
                        <Link
                          to={`/profile/${sUser._id}`}
                          style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}
                        >
                          {sUser.name}
                        </Link>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {sUser.role === 'employee' ? sUser.company : 'Job Seeker'}
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                      }}
                    >
                      {sUser.bio || 'Verified member of DevConnect.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/profile/${sUser._id}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Connect & View
                    </Link>
                    <Link
                      to={`/chat/${sUser._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <MessageSquare size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;

