import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If it's my own profile, just go to the normal edit profile page
    if (id === currentUser._id) {
      navigate('/profile');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/users/${id}`);
        setProfileUser(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, currentUser, navigate]);

  const requestReferral = async (employeeId, company) => {
    try {
      const message = prompt(`Send a brief message to request a referral at ${company}:`);
      if (message === null) return;

      await axios.post('/referrals/request', {
        referrerId: employeeId,
        company: company,
        message: message,
      });

      alert('Referral request sent successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to send referral request');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>User not found.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ border: 'none', padding: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        ← Back
      </button>

      <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {profileUser.avatarUrl ? (
             <img src={profileUser.avatarUrl} alt={profileUser.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-card)', marginBottom: '1.5rem', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }} />
          ) : (
             <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', border: '4px solid var(--bg-card)', marginBottom: '1.5rem', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
               {profileUser.name.charAt(0)}
             </div>
          )}

          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{profileUser.name}</h1>
          <p style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: '500', marginBottom: '1.5rem' }}>
            {profileUser.role === 'developer' ? 'Software Developer' : `Employee at ${profileUser.company}`}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
            <Link to={`/chat/${profileUser._id}`} className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>Message</Link>
            
            {currentUser?.role === 'developer' && profileUser.role === 'employee' && (
               <button onClick={() => requestReferral(profileUser._id, profileUser.company)} className="btn btn-outline" style={{ padding: '0.6rem 2rem' }}>Request Referral</button>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {profileUser.bio && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>About</h3>
              <p style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>{profileUser.bio}</p>
            </div>
          )}

          {profileUser.experience && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Experience</h3>
              <p style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>{profileUser.experience}</p>
            </div>
          )}

          {profileUser.skills && profileUser.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Skills & Expertise</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {profileUser.skills.map((skill, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(profileUser.githubUrl || profileUser.portfolioUrl) && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Links</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {profileUser.githubUrl && (
                  <a href={profileUser.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    View GitHub
                  </a>
                )}
                {profileUser.portfolioUrl && (
                  <a href={profileUser.portfolioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    View Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
          
          {!profileUser.bio && !profileUser.experience && (!profileUser.skills || profileUser.skills.length === 0) && !profileUser.githubUrl && !profileUser.portfolioUrl && (
             <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>This user hasn't added any additional details yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
