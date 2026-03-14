import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchReferrals = async () => {
      try {
        const { data } = await axios.get('/referrals/history');
        setReferrals(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [user, navigate]);

  const updateStatus = async (id, status) => {
    try {
      if (status === 'accepted') {
        await axios.put(`/referrals/${id}/accept`);
      } else {
        await axios.put(`/referrals/${id}/reject`);
      }

      // Update UI optimistically
      setReferrals(referrals.map(ref =>
        ref._id === id ? { ...ref, status } : ref
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard</h1>
        <Link to="/profile" className="btn btn-outline">Edit Profile</Link>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {user.role === 'developer' ? 'Software Developer' : `Employee at ${user.company}`}
            </p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Your Referrals</h2>

      {loading ? (
        <p>Loading...</p>
      ) : referrals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You don't have any referral requests yet.</p>
          {user.role === 'developer' ? (
            <Link to="/discover" className="btn btn-primary">Find Employees to Request</Link>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Developers will send you requests to review.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Categorized Sections */}
          {['pending', 'accepted', 'rejected'].map(statusCategory => {
            const categorizedReferrals = referrals.filter(r => r.status === statusCategory);

            if (categorizedReferrals.length === 0) return null;

            return (
              <div key={statusCategory}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                  {statusCategory} Requests
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {categorizedReferrals.map((ref) => (
                    <div key={ref._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{ref.company}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {user.role === 'developer' ? `Requested from: ${ref.referrer?.name}` : `Requested by: ${ref.requester?.name}`}
                        </p>
                        {user.role === 'employee' && (
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            {ref.requester?.resumeUrl && (
                              <Link
                                to={`/resume?url=${encodeURIComponent(ref.requester.resumeUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                              >
                                View Applicant Resume
                              </Link>
                            )}
                            <Link
                              to={`/profile/${ref.requester?._id}`}
                              style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                            >
                              View Profile
                            </Link>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '1rem',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          backgroundColor: ref.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' :
                            ref.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                              'rgba(245, 158, 11, 0.2)',
                          color: ref.status === 'accepted' ? 'var(--success)' :
                            ref.status === 'rejected' ? 'var(--danger)' :
                              'var(--warning)'
                        }}>
                          {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                        </span>

                        {user.role === 'employee' && ref.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                            <button onClick={() => updateStatus(ref._id, 'accepted')} className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Accept</button>
                            <button onClick={() => updateStatus(ref._id, 'rejected')} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Reject</button>
                          </div>
                        )}

                        <Link to={`/chat/${user.role === 'developer' ? ref.referrer?._id : ref.requester?._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
