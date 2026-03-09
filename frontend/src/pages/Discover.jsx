import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [searchParam, setSearchParam] = useState('');
  const [searchType, setSearchType] = useState('company'); // 'company' or 'skills'
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch users
        const { data: usersData } = await axios.get(`/users/discover?keyword=${searchParam}`);
        
        let filteredData = usersData;
        if (searchType === 'skills' && searchParam) {
           filteredData = usersData.filter(u => 
               u.skills && u.skills.some(skill => skill.toLowerCase().includes(searchParam.toLowerCase()))
           );
        }
        setUsers(filteredData);

        // Fetch user's sent referrals if they are a developer
        if (user.role === 'developer') {
          const { data: referralsData } = await axios.get('/referrals/history');
          // referralsData is an array of referral objects. We just need the referrer IDs.
          const requestedEmployeeIds = referralsData.map(ref => ref.referrer._id || ref.referrer);
          setSentRequests(requestedEmployeeIds);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchParam, searchType, user, navigate]);

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Discover Tech Talent</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Connect with industry professionals. Search by their affiliated company or specific tech stack.
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto 3rem auto', display: 'flex', gap: '1rem' }}>
        <select 
           className="input-field" 
           style={{ width: '150px', borderRadius: '3rem', padding: '1rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
           value={searchType}
           onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="company">Company</option>
          <option value="skills">Skills</option>
        </select>
        <input 
          type="text" 
          placeholder={searchType === 'company' ? "Search by company or name..." : "Search by React, Node, Python..."} 
          className="input-field"
          style={{ flexGrow: 1, padding: '1rem 1.5rem', fontSize: '1.1rem', borderRadius: '3rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No users found matching your search.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {users.map((u) => (
            <UserCard 
              key={u._id} 
              employee={u} 
              hasRequested={sentRequests.includes(u._id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;
