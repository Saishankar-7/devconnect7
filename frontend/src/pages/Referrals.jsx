import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/ui/UserAvatar';
import { StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { 
  Briefcase, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Filter,
  ExternalLink,
  Calendar,
  Building2,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

const Referrals = () => {
  const { user, loading: authLoading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/referrals/history');
      setReferrals(data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReferrals();
  }, [authLoading, user, navigate, fetchReferrals]);

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
      console.error('Status update failed:', err);
      alert('Failed to update referral. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const isDev = user.role === 'developer';

  // Filtered & Sorted Referrals
  const filteredReferrals = referrals
    .filter((r) => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Search
      if (search) {
        const query = search.toLowerCase();
        const counterpart = isDev ? r.referrer : r.requester;
        const matchesComp = r.company?.toLowerCase().includes(query);
        const matchesName = counterpart?.name?.toLowerCase().includes(query);
        const matchesMsg = r.message?.toLowerCase().includes(query);
        return matchesComp || matchesName || matchesMsg;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    accepted: referrals.filter((r) => r.status === 'accepted').length,
    rejected: referrals.filter((r) => r.status === 'rejected').length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '4rem' }}>
      {/* Referral Tracker Header */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-main)',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
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
              <Briefcase size={14} color="#3B82F6" />
              Complete Referral Lifecycle Management
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
              Employee Referral Tracker
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 1.75rem' }}>
              {isDev
                ? 'Track your sent referral requests, review status milestones, and connect with employee referrers.'
                : 'Review applications from top engineering candidates and grant direct employee referrals.'}
            </p>

            {/* Quick Status Filter Tabs */}
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
              {[
                { id: 'all', label: 'All Requests', count: counts.all },
                { id: 'pending', label: 'Pending Review', count: counts.pending },
                { id: 'accepted', label: 'Accepted', count: counts.accepted },
                { id: 'rejected', label: 'Declined', count: counts.rejected },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    backgroundColor: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                    color: statusFilter === tab.id ? 'var(--primary-blue)' : 'var(--text-secondary)',
                    boxShadow: statusFilter === tab.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Referral Management Content */}
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Controls Bar: Search & Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          {/* Search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <Search size={16} color="var(--text-subtle)" />
            <input
              type="text"
              placeholder="Search company, person, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* List of Referrals */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filteredReferrals.length === 0 ? (
          <EmptyState
            type="inbox"
            title="No referral requests found"
            description={
              isDev
                ? 'You have not submitted any referral requests matching this filter. Browse our company referrers to apply!'
                : 'No candidate requests found matching this filter.'
            }
            actionLabel={isDev ? 'Find Referrers' : undefined}
            actionTo={isDev ? '/discover' : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReferrals.map((item) => {
              const counterpart = isDev ? item.referrer : item.requester;
              const isPending = item.status === 'pending';

              return (
                <div
                  key={item._id}
                  className="card card-hover"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                >
                  {/* Left Column: Company & Counterpart details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                    <UserAvatar user={counterpart} size="md" showRoleDot={true} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {item.company}
                        </h3>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isDev ? 'Employee Referrer' : 'Candidate Applicant'}:{' '}
                        <Link
                          to={`/profile/${counterpart?._id}`}
                          style={{ fontWeight: 600, color: 'var(--primary-blue)' }}
                        >
                          {counterpart?.name || 'User'}
                        </Link>
                        {counterpart?.email && <span> · {counterpart.email}</span>}
                      </div>

                      {/* Request message */}
                      {item.message && (
                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-muted)',
                            borderRadius: '8px',
                            fontSize: '0.84375rem',
                            color: 'var(--text-primary)',
                            margin: '8px 0',
                            lineHeight: 1.5,
                            borderLeft: '3px solid var(--primary-blue)',
                          }}
                        >
                          "{item.message}"
                        </div>
                      )}

                      {/* Date & Job Link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78125rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          Requested {formatDate(item.createdAt)}
                        </span>

                        {item.jobUrl && (
                          <a
                            href={item.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--primary-blue)',
                              fontWeight: 500,
                            }}
                          >
                            <span>Target Role Link</span>
                            <ExternalLink size={12} />
                          </a>
                        )}

                        {!isDev && counterpart?.resumeUrl && (
                          <Link
                            to={`/resume?url=${encodeURIComponent(counterpart.resumeUrl)}&name=${encodeURIComponent(counterpart.name)}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--primary-blue)',
                              fontWeight: 600,
                            }}
                          >
                            <FileText size={13} />
                            <span>View Candidate Resume</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'center' }}>
                    {!isDev && isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'accepted')}
                          disabled={updatingId === item._id}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#16A34A' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept & Refer</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'rejected')}
                          disabled={updatingId === item._id}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {counterpart?._id && (
                      <Link
                        to={`/chat/${counterpart._id}`}
                        className="btn btn-secondary btn-sm"
                        title="Chat with contact"
                      >
                        <MessageSquare size={14} />
                        <span>Chat</span>
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
  );
};

export default Referrals;

