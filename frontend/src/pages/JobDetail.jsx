import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI, resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
    if (user?.role === 'jobseeker') fetchResumes();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await jobsAPI.getOne(id);
      setJob(data.job);
    } catch {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getMyResumes();
      setResumes(data.resumes);
      const def = data.resumes.find((r) => r.isDefault);
      if (def) setSelectedResume(def._id);
    } catch {}
  };

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await applicationsAPI.apply(id, { resumeId: selectedResume, coverLetter });
      setApplied(true);
      setShowApplyModal(false);
      toast.success('🎉 Application submitted! AI analysis running...');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  if (!job) return null;

  const salaryText = job.salaryMin
    ? `₹${(job.salaryMin / 100000).toFixed(1)} – ₹${(job.salaryMax / 100000).toFixed(1)} LPA`
    : 'Competitive';

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail-layout">
          {/* Main Content */}
          <div className="job-detail-main">
            {/* Header */}
            <div className="job-detail-header card">
              <div className="jd-header-top">
                <div className="jd-company-logo">{job.company?.charAt(0).toUpperCase()}</div>
                <div className="jd-title-area">
                  <h1>{job.title}</h1>
                  <p className="jd-company-name">{job.company}</p>
                  <div className="jd-quick-info">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.jobType}</span>
                    <span>📈 {job.experienceLevel}</span>
                    <span>💰 {salaryText}</span>
                  </div>
                </div>
              </div>
              <div className="jd-tags">
                {job.requiredSkills?.map((s) => <span key={s} className="tag">{s}</span>)}
              </div>
              {user?.role === 'jobseeker' && !applied && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowApplyModal(true)}
                  style={{ marginTop: '1rem' }}
                >
                  ✨ Apply Now
                </button>
              )}
              {applied && (
                <div className="alert alert-success mt-2">✅ You've applied to this job! AI analysis is running.</div>
              )}
            </div>

            {/* Description */}
            <div className="card mt-2">
              <h3>📋 Job Description</h3>
              <p style={{ marginTop: '1rem', whiteSpace: 'pre-line', lineHeight: 1.8 }}>{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="card mt-2">
                <h3>🎯 Responsibilities</h3>
                <ul className="detail-list mt-2">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card mt-2">
                <h3>✅ Requirements</h3>
                <ul className="detail-list mt-2">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="card mt-2">
                <h3>🎁 Benefits</h3>
                <ul className="detail-list mt-2">
                  {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="job-detail-sidebar">
            <div className="card">
              <h3>📊 Job Overview</h3>
              <div className="overview-items mt-2">
                {[
                  { icon: '🏢', label: 'Company', value: job.company },
                  { icon: '📍', label: 'Location', value: job.location },
                  { icon: '💼', label: 'Type', value: job.jobType },
                  { icon: '📈', label: 'Experience', value: job.experienceLevel },
                  { icon: '💰', label: 'Salary', value: salaryText },
                  { icon: '👥', label: 'Openings', value: job.openings || 1 },
                  { icon: '👁', label: 'Views', value: job.views || 0 },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="overview-item">
                    <span className="overview-icon">{icon}</span>
                    <div>
                      <div className="overview-label">{label}</div>
                      <div className="overview-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {job.recruiter && (
              <div className="card mt-2">
                <h3>👤 Posted By</h3>
                <div className="recruiter-info mt-2">
                  <div className="recruiter-avatar">{job.recruiter.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{job.recruiter.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.recruiter.company}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.recruiter.email}</div>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'jobseeker' && !applied && (
              <button className="btn btn-primary btn-block btn-lg mt-2" onClick={() => setShowApplyModal(true)}>
                ✨ Apply for this Job
              </button>
            )}
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Apply for {job.title}</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>at {job.company}</p>
            <div className="divider" />

            {resumes.length > 0 ? (
              <div className="form-group mt-2">
                <label className="form-label">Select Resume</label>
                <select
                  className="form-select" value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  <option value="">No resume (apply without)</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} {r.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="alert alert-info mt-2">
                💡 Upload a resume from your dashboard to enable AI analysis!
              </div>
            )}

            <div className="form-group mt-2">
              <label className="form-label">Cover Letter (Optional)</label>
              <textarea
                className="form-textarea" rows={4}
                placeholder="Why are you a great fit for this role?"
                value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleApply} disabled={applying}>
                {applying ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
