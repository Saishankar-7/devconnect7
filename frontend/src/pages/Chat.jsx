import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/ChatBox';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge } from '../components/ui/Badge';
import { Search, X, MessageSquare, Users, Menu, ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();

  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/users');
      const filtered = data.filter((u) => u._id !== user._id);
      setContacts(filtered);

      if (userId) {
        const found = filtered.find((u) => u._id === userId);
        if (found) setActiveUser(found);
      } else if (filtered.length > 0 && window.innerWidth > 768) {
        // Auto-select first contact on desktop
        setActiveUser(filtered[0]);
      }
    } catch (err) {
      console.error('Error fetching chat contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchContacts();
  }, [authLoading, user, navigate, fetchContacts]);

  const handleSelectUser = (contact) => {
    setActiveUser(contact);
    setMobileDrawerOpen(false);
    navigate(`/chat/${contact._id}`, { replace: true });
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
  });

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      <div
        className="container"
        style={{
          flex: 1,
          display: 'flex',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Main Chat Shell Container */}
        <div
          className="card"
          style={{
            flex: 1,
            display: 'flex',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Left Panel: Contacts List */}
          <aside
            style={{
              width: '320px',
              borderRight: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
              zIndex: 20,
              // Mobile drawer positioning
              ...(window.innerWidth <= 768
                ? {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    transform: mobileDrawerOpen || !activeUser ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                  }
                : {}),
            }}
          >
            {/* Contacts Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Messages
                </h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary-blue)',
                    backgroundColor: '#EFF6FF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {filteredContacts.length} Contacts
                </span>
              </div>

              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 10px',
                }}
              >
                <Search size={16} color="var(--text-subtle)" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.84375rem',
                    width: '100%',
                  }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Contacts Scroll List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Loading contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No contacts found
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = activeUser?._id === contact._id;
                  return (
                    <div
                      key={contact._id}
                      onClick={() => handleSelectUser(contact)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 1rem',
                        borderBottom: '1px solid #F8FAFC',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--primary-blue)' : '3px solid transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <UserAvatar user={contact} size="sm" showRoleDot={true} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.875rem',
                            color: isSelected ? 'var(--primary-blue)' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {contact.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px',
                          }}
                        >
                          {contact.role === 'employee' ? `Referrer @ ${contact.company || 'Tech'}` : 'Developer'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Panel: Active Conversation */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
            {activeUser ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Mobile Back / Toggle bar */}
                <div
                  style={{
                    display: window.innerWidth <= 768 ? 'flex' : 'none',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-main)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <button
                    onClick={() => setMobileDrawerOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px', padding: '4px 10px' }}
                  >
                    <ArrowLeft size={14} />
                    All Contacts
                  </button>
                </div>

                <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                  <ChatBox activeUser={activeUser} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  maxWidth: '380px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <MessageSquare size={30} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                  Direct Real-time Messaging
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Select a contact from the list on the left to start a real-time conversation and discuss career referrals.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Chat;
