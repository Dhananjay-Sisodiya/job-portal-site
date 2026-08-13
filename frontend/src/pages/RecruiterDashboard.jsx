import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-warning' },
  reviewing: { label: 'Reviewing', color: 'badge-info' },
  shortlisted: { label: 'Shortlisted', color: 'badge-primary' },
  accepted: { label: 'Accepted', color: 'badge-success' },
  rejected: { label: 'Rejected', color: 'badge-danger' },
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await jobsAPI.getMyJobs();
      setJobs(data.jobs);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsAPI.delete(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>🏢 Recruiter Dashboard</h1>
            <p>{user?.company || 'Your Company'} · Manage your jobs & candidates</p>
          </div>
          <Link to="/recruiter/post-job" className="btn btn-primary">+ Post New Job</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { icon: '📋', value: jobs.length, label: 'Total Jobs Posted' },
            { icon: '✅', value: activeJobs, label: 'Active Listings' },
            { icon: '👥', value: totalApplications, label: 'Total Applications' },
            { icon: '👁', value: totalViews, label: 'Total Views' },
          ].map((s) => (
            <div className="dash-stat-card card" key={s.label}>
              <div className="dash-stat-icon">{s.icon}</div>
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>📋 My Jobs</button>
          <button className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="dash-section">
            {jobs.length === 0 ? (
              <div className="empty-state card">
                <div style={{ fontSize: '3rem' }}>📭</div>
                <h3>No jobs posted yet</h3>
                <p>Start attracting talent by posting your first job</p>
                <Link to="/recruiter/post-job" className="btn btn-primary mt-2">+ Post Your First Job</Link>
              </div>
            ) : (
              <div className="recruiter-jobs-grid">
                {jobs.map((job) => (
                  <div className="recruiter-job-card card" key={job._id}>
                    <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem' }}>{job.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          📍 {job.location} · {job.jobType}
                        </p>
                      </div>
                      <span className={`badge ${job.isActive ? 'badge-success' : 'badge-gray'}`}>
                        {job.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </div>

                    <div className="recruiter-job-stats mt-2">
                      <div className="rj-stat">
                        <span className="rj-stat-val">{job.applicationCount || 0}</span>
                        <span className="rj-stat-label">Applications</span>
                      </div>
                      <div className="rj-stat">
                        <span className="rj-stat-val">{job.views || 0}</span>
                        <span className="rj-stat-label">Views</span>
                      </div>
                      <div className="rj-stat">
                        <span className="rj-stat-val">{job.openings || 1}</span>
                        <span className="rj-stat-label">Openings</span>
                      </div>
                    </div>

                    <div className="skill-chips mt-2">
                      {job.requiredSkills?.slice(0, 3).map((s) => <span key={s} className="tag">{s}</span>)}
                      {job.requiredSkills?.length > 3 && <span className="tag">+{job.requiredSkills.length - 3}</span>}
                    </div>

                    <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
                      <Link to={`/recruiter/jobs/${job._id}/applications`} className="btn btn-primary btn-sm">
                        👥 View Candidates ({job.applicationCount || 0})
                      </Link>
                      <Link to={`/jobs/${job._id}`} className="btn btn-secondary btn-sm">👁 Preview</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dash-section">
            <div className="card">
              <h3>🏢 Company Profile</h3>
              <div className="profile-grid mt-2">
                {[
                  { label: 'Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Company', value: user?.company || '—' },
                  { label: 'Designation', value: user?.designation || '—' },
                  { label: 'Phone', value: user?.phone || '—' },
                  { label: 'Location', value: user?.location || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="profile-field">
                    <div className="profile-field-label">{label}</div>
                    <div className="profile-field-value">{value}</div>
                  </div>
                ))}
              </div>
              <Link to="/recruiter/profile" className="btn btn-primary mt-3">✏️ Edit Profile</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
