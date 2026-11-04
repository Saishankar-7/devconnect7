import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge, SkillBadge } from '../components/ui/Badge';
import { GithubIcon } from '../components/ui/BrandIcons';
import { 
  Camera, 
  FileText, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Briefcase, 
  Building2, 
  Mail, 
  Sparkles, 
  User, 
  Eye, 
  Edit3
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview'
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

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [toast, setToast] = useState(null); // { type, text }

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      bio: user.bio || '',
      githubUrl: user.githubUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      experience: user.experience || '',
    });
  }, [authLoading, user, navigate]);

  const showToast = (type, text) => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ type, text });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload Avatar to Cloudinary
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    setUploadingAvatar(true);

    try {
      const { data } = await axios.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: updated } = await axios.put('/users/profile', { avatarUrl: data.url });
      updateUser(updated);
      showToast('success', 'Profile picture updated successfully!');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Upload Resume to Cloudinary
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    setUploadingResume(true);

    try {
      const { data } = await axios.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: updated } = await axios.put('/users/profile', { resumeUrl: data.url });
      updateUser(updated);
      showToast('success', 'Resume document uploaded and verified!');
    } catch (err) {
      console.error('Resume upload failed:', err);
      showToast('error', 'Failed to upload resume. Ensure file is PDF or DOC.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const { data: updated } = await axios.put('/users/profile', {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        skills: skillsArray,
        bio: formData.bio,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        experience: formData.experience,
      });

      updateUser(updated);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast('error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const isDev = user.role === 'developer';
  const parsedSkills = formData.skills
    ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', paddingBottom: '5rem' }}>
      {/* Toast Feedback */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: toast.type === 'success' ? '#15803D' : '#B91C1C',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 1200,
            animation: 'slideUp 0.25s ease',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Cover Header Banner */}
      <div
        style={{
          height: '180px',
          background: 'linear-gradient(135deg, #172554 0%, #1E3A8A 50%, #3B82F6 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container" style={{ marginTop: '-70px', position: 'relative', zIndex: 10 }}>
        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Avatar and Info */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar user={user} size="xl" showRoleDot={true} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-blue)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                }}
                title="Change Profile Photo"
              >
                {uploadingAvatar ? <span className="spinner spinner-primary" style={{ width: '14px', height: '14px' }} /> : <Camera size={15} />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {user.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <RoleBadge role={user.role} company={user.company} size="sm" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Selector: Edit vs Live Preview */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-muted)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'edit' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'edit' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'edit' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <Edit3 size={14} />
              Edit Portfolio
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'preview' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'preview' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'preview' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <Eye size={14} />
              Preview Profile
            </button>
          </div>
        </div>

        {/* View Mode: Live Preview */}
        {activeTab === 'preview' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                About
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {formData.bio || 'No bio written yet. Switch to the Edit Portfolio tab to add your background and career goals.'}
              </p>
            </div>

            {/* Experience / Company Details */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                {isDev ? 'Experience & Background' : 'Current Company & Experience'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    <Building2 size={16} color="var(--primary-blue)" />
                    <span>Company: <strong>{formData.company}</strong></span>
                  </div>
                )}
                {formData.experience && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    <Briefcase size={16} color="var(--primary-blue)" />
                    <span>Experience: <strong>{formData.experience}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {parsedSkills.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Skills & Technologies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {parsedSkills.map((s, idx) => (
                    <SkillBadge key={idx} skill={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Links & Resume */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Verified Documents & Links
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {user.resumeUrl && (
                  <Link
                    to={`/resume?url=${encodeURIComponent(user.resumeUrl)}&name=${encodeURIComponent(user.name)}`}
                    className="btn btn-outline btn-sm"
                  >
                    <FileText size={14} />
                    View Attached Resume
                  </Link>
                )}
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <GithubIcon size={14} />
                    GitHub Profile
                  </a>
                )}
                {formData.portfolioUrl && (
                  <a
                    href={formData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Globe size={14} />
                    Personal Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* View Mode: Edit Form */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Left Column: Personal and Professional Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Basic Info */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Personal Information
                  </h3>

                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="bio">
                      <span>Professional Headline & Bio</span>
                      <span className="form-hint">{formData.bio.length}/300</span>
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="form-textarea"
                      rows={4}
                      placeholder="Share your technical interests, past experiences, or what roles you are actively seeking..."
                      value={formData.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 300) handleChange(e);
                      }}
                    />
                  </div>
                </div>

                {/* Role Specific Details */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    {isDev ? 'Skills & Specializations' : 'Company & Role Details'}
                  </h3>

                  {!isDev ? (
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="company">Current Company</label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          className="form-input"
                          placeholder="e.g. Google, Stripe, Meta"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="experience">Years of Experience</label>
                        <input
                          id="experience"
                          name="experience"
                          type="text"
                          className="form-input"
                          placeholder="e.g. 5+ years, Staff Engineer"
                          value={formData.experience}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="skills">
                          <span>Skills & Technologies</span>
                          <span className="form-hint">Comma separated</span>
                        </label>
                        <input
                          id="skills"
                          name="skills"
                          type="text"
                          className="form-input"
                          placeholder="React, TypeScript, Python, Node.js, AWS, GraphQL"
                          value={formData.skills}
                          onChange={handleChange}
                        />
                        {parsedSkills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                            {parsedSkills.map((s, idx) => (
                              <SkillBadge key={idx} skill={s} />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="company">Interested In Target Companies</label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          className="form-input"
                          placeholder="e.g. Microsoft, Stripe, Vercel"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Links, Resume Upload & Save */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Resume Upload Box (Highest priority for job seekers) */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Resume Document
                    </h3>
                    {user.resumeUrl && (
                      <span className="badge badge-success">
                        <CheckCircle size={12} />
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => resumeInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-main)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-subtle)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-blue)';
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-main)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }}
                  >
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingResume}
                    />

                    {uploadingResume ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span className="spinner spinner-primary" style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontSize: '0.84375rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                          Uploading to secure cloud...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid var(--border-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 10px',
                            color: 'var(--primary-blue)',
                          }}
                        >
                          <Upload size={18} />
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Click to upload new resume
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          PDF or DOCX (max 5MB)
                        </div>
                      </>
                    )}
                  </div>

                  {user.resumeUrl && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <Link
                        to={`/resume?url=${encodeURIComponent(user.resumeUrl)}&name=${encodeURIComponent(user.name)}`}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        <FileText size={14} />
                        Preview Current Resume
                      </Link>
                    </div>
                  )}
                </div>

                {/* Social & Portfolio Links */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Links & Profiles
                  </h3>

                  <div className="form-group">
                    <label className="form-label" htmlFor="githubUrl">GitHub Profile URL</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                        <GithubIcon size={16} />
                      </span>
                      <input
                        id="githubUrl"
                        name="githubUrl"
                        type="url"
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        placeholder="https://github.com/username"
                        value={formData.githubUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolioUrl">Personal Portfolio / Website</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                        <Globe size={16} />
                      </span>
                      <input
                        id="portfolioUrl"
                        name="portfolioUrl"
                        type="url"
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        placeholder="https://yourdomain.com"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Bar */}
                <div className="card" style={{ padding: '1.25rem', backgroundColor: '#F8FAFC' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner" />
                        Saving Portfolio...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '8px 0 0' }}>
                    Changes are instantly synced across your public profile.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
