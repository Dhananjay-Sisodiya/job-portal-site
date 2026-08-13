import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
    education: user?.education || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    company: user?.company || '',
    companyWebsite: user?.companyWebsite || '',
    companyDescription: user?.companyDescription || '',
    designation: user?.designation || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser(form);
      toast.success('✅ Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page-header">
          <div className="profile-avatar-lg">{user?.name?.charAt(0)}</div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            <span className={`badge ${user?.role === 'recruiter' ? 'badge-warning' : 'badge-success'}`}>
              {user?.role === 'recruiter' ? '🏢 Recruiter' : '🎯 Job Seeker'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Info */}
          <div className="card">
            <h3>👤 Personal Information</h3>
            <div className="form-grid-3 mt-2">
              {[
                { name: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                { name: 'location', label: 'Location', placeholder: 'Mumbai, India' },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className="form-group">
                  <label className="form-label">{label}</label>
                  <input name={name} value={form[name]} onChange={handleChange} className="form-input" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="form-group mt-2">
              <label className="form-label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} className="form-textarea" rows={3} placeholder="Tell recruiters about yourself..." />
            </div>
          </div>

          {/* Role-specific */}
          {user?.role === 'jobseeker' ? (
            <div className="card">
              <h3>💼 Professional Details</h3>
              <div className="form-grid-3 mt-2">
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input type="number" name="experience" value={form.experience} onChange={handleChange} className="form-input" placeholder="3" min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input name="education" value={form.education} onChange={handleChange} className="form-input" placeholder="B.Tech, CS" />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} className="form-input" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className="form-input" placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Portfolio URL</label>
                  <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} className="form-input" placeholder="https://yoursite.com" />
                </div>
              </div>
              <div className="form-group mt-2">
                <label className="form-label">Skills (comma separated)</label>
                <input name="skills" value={form.skills} onChange={handleChange} className="form-input" placeholder="React, Node.js, Python, MongoDB..." />
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>🏢 Company Details</h3>
              <div className="form-grid-3 mt-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input name="company" value={form.company} onChange={handleChange} className="form-input" placeholder="Tech Corp Ltd." />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Designation</label>
                  <input name="designation" value={form.designation} onChange={handleChange} className="form-input" placeholder="HR Manager" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Website</label>
                  <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} className="form-input" placeholder="https://company.com" />
                </div>
              </div>
              <div className="form-group mt-2">
                <label className="form-label">Company Description</label>
                <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} className="form-textarea" rows={3} placeholder="About your company..." />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
