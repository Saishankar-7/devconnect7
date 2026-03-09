import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '6rem 0', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, background: 'linear-gradient(135deg, #f8f9fa, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get Referred to Your Dream Tech Job
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Connect directly with employees at top tech companies. Showcase your skills, build relationships, and secure the referral that gets your resume past the filters.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Join as Developer
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              I'm an Employee
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container" style={{ padding: '4rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Find Employees</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Search our database of employees by company, role, or technology stack to find the perfect match for referring you.</p>
        </div>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Real-time Chat</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Communicate directly with employees using our secure, real-time messaging system built right into the platform.</p>
        </div>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Track Referrals</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all your referral requests in one place with status updates from 'pending' to 'completed'.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
