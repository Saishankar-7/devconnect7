import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    skills: '',
    bio: '',
    githubUrl: '',
    portfolioUrl: '',
    experience: '',
  });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company: user.company || '',
        skills: user.skills ? user.skills.join(', ') : '',
        bio: user.bio || '',
        githubUrl: user.githubUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        experience: user.experience || '',
      });
    }
  }, [user, navigate]);

  const { name, email, company, skills, bio, githubUrl, portfolioUrl, experience } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/upload', uploadData, config);
      
      // Update user with new avatar
      const { data: updatedProfile } = await axios.put('/users/profile', { avatarUrl: data.url });
      
      updateUser(updatedProfile);
      
      setMessage('Avatar uploaded successfully!');
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      setMessage('Failed to upload avatar.');
    }
  };

  const uploadResumeHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setUploadingResume(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/upload', uploadData, config);
      
      // Update user with new resume URL
      const { data: updatedProfile } = await axios.put('/users/profile', { resumeUrl: data.url });
      
      updateUser(updatedProfile);
      
      setMessage('Resume uploaded successfully!');
      setUploadingResume(false);
    } catch (error) {
      console.error(error);
      setUploadingResume(false);
      setMessage('Failed to upload resume.');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills ? String(skills).split(',').map((s) => s.trim()) : [];
      const { data: updatedProfile } = await axios.put('/users/profile', {
        name,
        email,
        company,
        skills: skillsArray,
        bio,
        githubUrl,
        portfolioUrl,
        experience,
      });
      
      updateUser(updatedProfile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Error updating profile');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Edit Profile</h1>
      
      {message && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{message}</div>}

      <div className="glass-card">
        <div style={{ marginBottom: '2rem' }}>
          <label className="input-label">Profile Avatar</label>
          <input type="file" onChange={uploadFileHandler} style={{ display: 'block', marginTop: '0.5rem' }} />
          {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Uploading...</p>}
        </div>

        <form onSubmit={submitHandler}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" className="input-field" value={name} onChange={onChange} required />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" className="input-field" value={email} onChange={onChange} required />
          </div>

          {user?.role === 'employee' && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="company">Company</label>
                <input type="text" id="company" name="company" className="input-field" value={company} onChange={onChange} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="experience">Experience</label>
                <input type="text" id="experience" name="experience" className="input-field" value={experience} onChange={onChange} placeholder="e.g. 5+ years" />
              </div>
            </>
          )}

          {user?.role === 'developer' && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="skills">Skills (comma separated)</label>
                <input type="text" id="skills" name="skills" className="input-field" value={skills} onChange={onChange} placeholder="React, Node.js, Python" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="githubUrl">GitHub URL</label>
                <input type="url" id="githubUrl" name="githubUrl" className="input-field" value={githubUrl} onChange={onChange} placeholder="https://github.com/yourusername" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="portfolioUrl">Portfolio URL</label>
                <input type="url" id="portfolioUrl" name="portfolioUrl" className="input-field" value={portfolioUrl} onChange={onChange} placeholder="https://yourportfolio.com" />
              </div>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                 <label className="input-label">Resume Upload (PDF)</label>
                 <input type="file" onChange={uploadResumeHandler} accept=".pdf,.doc,.docx" style={{ display: 'block', marginTop: '0.2rem' }} />
                 {uploadingResume && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Uploading Resume...</p>}
                 {user?.resumeUrl && (
                   <div style={{ marginTop: '0.5rem' }}>
                     <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                       View Current Resume
                     </a>
                   </div>
                 )}
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" className="input-field" rows="4" value={bio} onChange={onChange} placeholder="Tell us about yourself..."></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
