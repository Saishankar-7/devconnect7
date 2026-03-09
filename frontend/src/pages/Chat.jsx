import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/ChatBox';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams(); // Selected user from URL
  
  const [usersList, setUsersList] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Fetch all users to have a list of potential people to chat with. 
        // In a production app, this would be a specific endpoint returning only users you have active chats/referrals with.
        const { data } = await axios.get('/users');
        const others = data.filter(u => u._id !== user._id);
        setUsersList(others);
        
        if (userId) {
          const selected = others.find(u => u._id === userId);
          if (selected) setActiveUser(selected);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user, navigate, userId]);

  const handleSelectUser = (u) => {
    setActiveUser(u);
    navigate(`/chat/${u._id}`, { replace: true });
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '0 1.5rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="glass-card" style={{ flexGrow: 1, display: 'flex', margin: '1rem 0', padding: 0, overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>Conversations</h2>
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ padding: '0.6rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}
            />
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
            ) : filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No contacts found.</p>
            ) : (
              filteredUsers.map((u) => (
                <div 
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: activeUser?._id === u._id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (activeUser?._id !== u._id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseOut={(e) => {
                    if (activeUser?._id !== u._id) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{u.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {u.role === 'developer' ? 'Software Developer' : u.company}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Window */}
        <ChatBox activeUser={activeUser} />

      </div>
    </div>
  );
};

export default Chat;
