import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { SkeletonUserCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { 
  Search, 
  X, 
  Filter, 
  Building2, 
  Code2, 
  Sparkles, 
  Star, 
  SlidersHorizontal,
  Users,
  Briefcase
} from 'lucide-react';

// Debounce hook
const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const POPULAR_COMPANIES = ['All', 'Google', 'Microsoft', 'Meta', 'Amazon', 'Stripe', 'Apple', 'Netflix'];
const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'TypeScript', 'Java', 'AWS', 'Go'];

const Discover = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all', 'employee', 'developer'
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'rating', 'newest'

  const debouncedSearch = useDebounce(searchInput, 350);

  // Fetch users & referral history
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Backend search query
      const { data: usersData } = await axios.get(`/users/discover?keyword=${encodeURIComponent(debouncedSearch)}`);
      setUsers(usersData);

      // If developer, fetch sent referral requests to mark them
      if (user.role === 'developer') {
        try {
          const { data: referralsData } = await axios.get('/referrals/history');
          const ids = referralsData.map((ref) => {
            if (typeof ref.referrer === 'object' && ref.referrer?._id) {
              return ref.referrer._id;
            }
            return ref.referrer;
          });
          setSentRequests(ids);
        } catch {
          // Non-critical, ignore
        }
      }
    } catch (err) {
      console.error('Error fetching discovery users:', err);
      setError('Unable to load professionals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [authLoading, user, navigate, fetchData]);

  // Client-side filtering & sorting
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Company filter
      if (selectedCompany !== 'All') {
        if (!u.company || !u.company.toLowerCase().includes(selectedCompany.toLowerCase())) {
          return false;
        }
      }

      // Role filter
      if (selectedRole !== 'all') {
        if (u.role !== selectedRole) {
          return false;
        }
      }

      // Skill filter
      if (selectedSkill) {
        if (!u.skills || !u.skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()))) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      // Featured: Referrers with ratings first, then active profiles
      const scoreA = (a.role === 'employee' ? 10 : 0) + (a.rating || 0) + (a.resumeUrl ? 2 : 0);
      const scoreB = (b.role === 'employee' ? 10 : 0) + (b.rating || 0) + (b.resumeUrl ? 2 : 0);
      return scoreB - scoreA;
    });
  }, [users, selectedCompany, selectedRole, selectedSkill, sortBy]);

  const clearAllFilters = () => {
    setSearchInput('');
    setSelectedCompany('All');
    setSelectedRole('all');
    setSelectedSkill('');
    setSortBy('featured');
  };

  const hasActiveFilters = searchInput || selectedCompany !== 'All' || selectedRole !== 'all' || selectedSkill;

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div className="spinner spinner-primary" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Connecting to network...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '4rem' }}>
      {/* Hero Header */}
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
              <Sparkles size={14} color="#3B82F6" />
              Verified Tech Network & Referrals
            </span>

            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: '0.75rem',
                lineHeight: 1.2,
              }}
            >
              Discover Industry Professionals & Referrers
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: '0 auto 1.75rem',
              }}
            >
              Connect directly with verified software engineers and employees at your target tech companies. Request referrals and expand your career network.
            </p>

            {/* Central Search Bar */}
            <div
              style={{
                position: 'relative',
                maxWidth: '640px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid var(--border-main)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: '6px 10px',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={20} style={{ color: 'var(--text-subtle)', marginLeft: '6px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by name, company, skill (e.g. Google, React, Meta)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '8px 12px',
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                }}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  style={{
                    padding: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Discover Content */}
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top Filter Row: Role selector + Sort by + Reset */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Role Radio Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-muted)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setSelectedRole('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: selectedRole === 'all' ? '#FFFFFF' : 'transparent',
                  color: selectedRole === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: selectedRole === 'all' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                All Members
              </button>
              <button
                onClick={() => setSelectedRole('employee')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: selectedRole === 'employee' ? '#FFFFFF' : 'transparent',
                  color: selectedRole === 'employee' ? '#15803D' : 'var(--text-secondary)',
                  boxShadow: selectedRole === 'employee' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Building2 size={13} />
                Referrers
              </button>
              <button
                onClick={() => setSelectedRole('developer')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: selectedRole === 'developer' ? '#FFFFFF' : 'transparent',
                  color: selectedRole === 'developer' ? '#1D4ED8' : 'var(--text-secondary)',
                  boxShadow: selectedRole === 'developer' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Code2 size={13} />
                Job Seekers
              </button>
            </div>

            {/* Sort Dropdown & Clear Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.8125rem',
                    width: 'auto',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="rating">Top Rated Referrers</option>
                  <option value="newest">Recently Joined</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--danger)',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Quick Company Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Companies:
            </span>
            {POPULAR_COMPANIES.map((comp) => {
              const active = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? '#172554' : 'var(--bg-muted)',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${active ? '#172554' : 'var(--border-main)'}`,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {comp}
                </button>
              );
            })}
          </div>

          {/* Quick Skill Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Skills:
            </span>
            {POPULAR_SKILLS.map((skill) => {
              const active = selectedSkill.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(active ? '' : skill)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                    color: active ? '#1D4ED8' : 'var(--text-secondary)',
                    border: `1px solid ${active ? '#93C5FD' : 'var(--border-main)'}`,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            padding: '0 4px',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'professional' : 'professionals'}
            {selectedCompany !== 'All' && <span> at <strong>{selectedCompany}</strong></span>}
            {selectedRole !== 'all' && <span> ({selectedRole === 'employee' ? 'Referrers' : 'Job Seekers'})</span>}
          </div>

          {user.role === 'developer' && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 500 }}>
              💡 Click "Request Referral" on any employee card
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              color: '#B91C1C',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{error}</span>
            <button onClick={fetchData} className="btn btn-secondary btn-sm">
              Retry
            </button>
          </div>
        )}

        {/* Profile Cards Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonUserCard key={i} />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            type="users"
            title="No professionals found matching your criteria"
            description="Try clearing your search query or selecting a different company or skill filter."
            actionLabel="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredUsers.map((item, idx) => (
              <UserCard
                key={item._id}
                employee={item}
                hasRequested={sentRequests.includes(item._id)}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
