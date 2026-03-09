import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserCard = ({ employee, hasRequested }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt={employee.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {employee.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
            {employee.name}
            <span style={{
                marginLeft: '0.5rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '1rem',
                fontSize: '0.65rem',
                fontWeight: '600',
                backgroundColor: employee.role === 'employee' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                color: employee.role === 'employee' ? 'var(--success)' : 'var(--primary)',
                textTransform: 'uppercase',
                verticalAlign: 'middle'
            }}>
              {employee.role === 'employee' ? 'Job Referrer' : 'Job Seeker'}
            </span>
          </h3>
          <p style={{ color: 'var(--accent-primary)', fontWeight: '500', fontSize: '0.9rem' }}>{employee.company}</p>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexGrow: 1, fontStyle: employee.bio ? 'normal' : 'italic' }}>
        {employee.bio 
          ? (employee.bio.length > 100 ? `${employee.bio.substring(0, 100)}...` : employee.bio) 
          : "No bio provided."}
      </p>

      {employee.skills && employee.skills.length > 0 && (
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
             {employee.skills.slice(0, 3).map((skill, index) => (
                 <span key={index} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                     {skill}
                 </span>
             ))}
             {employee.skills.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{employee.skills.length - 3}</span>}
         </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
        {user?.role === 'developer' ? (
          employee.role === 'employee' && (
            <button 
              onClick={() => requestReferral(employee._id, employee.company)}
              className="btn btn-primary" 
              style={{ width: '100%', opacity: hasRequested ? 0.6 : 1, cursor: hasRequested ? 'not-allowed' : 'pointer' }}
              disabled={hasRequested}
            >
              {hasRequested ? 'Referral Requested' : 'Request Referral'}
            </button>
          )
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
            Only developers can request referrals
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/profile/${employee._id}`} style={{ flex: 1 }} className="btn btn-outline text-center">View Profile</Link>
          <Link to={`/chat/${employee._id}`} style={{ flex: 1 }} className="btn btn-outline text-center">Chat</Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
