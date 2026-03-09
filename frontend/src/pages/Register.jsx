import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    company: '',
  });

  const { register, error, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const { name, email, password, role, company } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 140px)', padding: '2rem 1.5rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Create an Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join DevConnect and start connecting</p>

        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="input-group">
            <label className="input-label" htmlFor="role">I am a...</label>
            <select 
              id="role" 
              name="role"
              className="input-field" 
              value={role}
              onChange={onChange}
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="developer" style={{ background: 'var(--bg-secondary)' }}>Software Developer</option>
              <option value="employee" style={{ background: 'var(--bg-secondary)' }}>Tech Company Employee</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              className="input-field" 
              placeholder="John Doe"
              value={name}
              onChange={onChange}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className="input-field" 
              placeholder="you@example.com"
              value={email}
              onChange={onChange}
              required 
            />
          </div>

          {role === 'employee' && (
            <div className="input-group">
              <label className="input-label" htmlFor="company">Company</label>
              <input 
                type="text" 
                id="company" 
                name="company"
                className="input-field" 
                placeholder="Google, Amazon, Meta, etc."
                value={company}
                onChange={onChange}
                required={role === 'employee'}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}>
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
