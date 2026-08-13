import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ScoreCircle = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-circle" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="score-number" style={{ color, fontSize: '1.1rem' }}>{score}</div>
    </div>
  );
};

const SourceBadge = ({ source }) => {
  if (source === 'gemini') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700,
        color: '#818cf8', marginBottom: '0.75rem',
      }}>✨ Gemini AI</span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)',
      borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700,
      color: '#38bdf8', marginBottom: '0.75rem',
    }}>🔬 NLP Analysis</span>
  );
};

const AnalysisCard = ({ analysis }) => {
  if (!analysis?.matchScore && analysis?.matchScore !== 0) return (
    <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>
      🔄 Analysis pending... Click "Run AI Analysis" to start.
    </div>
  );

  const totalSkills = (analysis.matchedSkills?.length || 0) + (analysis.missingSkills?.length || 0);
  const skillPct = totalSkills > 0 ? Math.round((analysis.matchedSkills?.length || 0) / totalSkills * 100) : 0;
  const isNLP = analysis.analysisSource === 'nlp-fallback' || analysis._source === 'nlp-fallback' || analysis.source === 'nlp-fallback';

  return (
    <div className="analysis-card">
      <SourceBadge source={isNLP ? 'nlp-fallback' : 'gemini'} />

      <div className="analysis-score-row">
        <ScoreCircle score={analysis.matchScore} />
        <div className="analysis-details">
          <div className="analysis-title">Match Score</div>
          {totalSkills > 0 && (
            <div className="score-bars">
              <div className="score-label-row">
                <span>Skills Match</span>
                <span>{skillPct}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${skillPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {analysis.strengths?.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section-title" style={{ color: '#34d399' }}>💪 Strengths</div>
          <ul className="suggestions-list">
            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {analysis.matchedSkills?.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section-title text-success">✅ Matched Skills</div>
          <div className="skill-chips">
            {analysis.matchedSkills.map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
          </div>
        </div>
      )}

      {analysis.missingSkills?.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section-title text-danger">❌ Missing Skills</div>
          <div className="skill-chips">
            {analysis.missingSkills.map((s) => <span key={s} className="skill-chip missing">{s}</span>)}
          </div>
        </div>
      )}

      {analysis.suggestions?.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section-title text-warning">💡 Suggestions</div>
          <ul className="suggestions-list">
            {analysis.suggestions.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {(analysis.analysisText || analysis.overallFeedback) && (
        <div className="analysis-feedback">
          <div className="analysis-section-title">📝 Feedback</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.6 }}>
            {analysis.analysisText || analysis.overallFeedback}
          </p>
        </div>
      )}

      {isNLP && (
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(14,165,233,0.08)', borderRadius: 8, fontSize: '0.78rem', color: '#7dd3fc', lineHeight: 1.5 }}>
          ℹ️ <strong>NLP mode:</strong> Gemini AI quota is exceeded. Score calculated using keyword matching & TF-IDF. Results are still meaningful!
        </div>
      )}
    </div>
  );
};

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-warning', icon: '⏳' },
  reviewing: { label: 'Reviewing', color: 'badge-info', icon: '🔍' },
  shortlisted: { label: 'Shortlisted', color: 'badge-primary', icon: '⭐' },
  accepted: { label: 'Accepted', color: 'badge-success', icon: '✅' },
  rejected: { label: 'Rejected', color: 'badge-danger', icon: '❌' },
};

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, resumeRes] = await Promise.all([
        applicationsAPI.getMyApplications(),
        resumeAPI.getMyResumes(),
      ]);
      setApplications(appsRes.data.applications);
      setResumes(resumeRes.data.resumes);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const { data } = await resumeAPI.upload(formData);
      setResumes((prev) => [data.resume, ...prev]);
      toast.success(`✅ Resume uploaded! Extracted ${data.parsedSkills?.length || 0} skills.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async (appId) => {
    setAnalyzing(true);
    try {
      const { data } = await applicationsAPI.analyze(appId);
      // Store both aiAnalysis AND analysisSource so AnalysisCard can show the correct badge
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId
            ? { ...a, aiAnalysis: { ...data.aiAnalysis, analysisSource: data.analysisSource } }
            : a
        )
      );
      const isNLP = data.analysisSource === 'nlp-fallback';
      if (isNLP) {
        toast('🔬 Analysis done via NLP! (Gemini quota exceeded)', { icon: 'ℹ️', duration: 6000 });
      } else {
        toast.success(`✨ Gemini AI analysis complete! Score: ${data.aiAnalysis?.matchScore}/100`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await resumeAPI.delete(resumeId);
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetDefault = async (resumeId) => {
    try {
      await resumeAPI.setDefault(resumeId);
      setResumes((prev) => prev.map((r) => ({ ...r, isDefault: r._id === resumeId })));
      toast.success('Default resume updated');
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    avgScore: applications.filter((a) => a.aiAnalysis?.matchScore)
      .reduce((sum, a, _, arr) => sum + a.aiAnalysis.matchScore / arr.length, 0) || 0,
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>👋 Hello, {user?.name?.split(' ')[0]}!</h1>
            <p>Track your applications and AI insights</p>
          </div>
          <Link to="/jobs" className="btn btn-primary">🔍 Browse More Jobs</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { icon: '📋', value: stats.total, label: 'Total Applications' },
            { icon: '⏳', value: stats.pending, label: 'Pending Review' },
            { icon: '✅', value: stats.accepted, label: 'Accepted' },
            { icon: '🤖', value: `${Math.round(stats.avgScore)}`, label: 'Avg AI Score' },
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
          {['applications', 'resume', 'profile'].map((tab) => (
            <button
              key={tab} className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'applications' ? '📋 My Applications' : tab === 'resume' ? '📄 My Resumes' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="dash-section">
            {applications.length === 0 ? (
              <div className="empty-state card">
                <div style={{ fontSize: '3rem' }}>📭</div>
                <h3>No applications yet</h3>
                <p>Start applying to jobs to track your progress here</p>
                <Link to="/jobs" className="btn btn-primary mt-2">Browse Jobs</Link>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => {
                  const sc = statusConfig[app.status] || statusConfig.pending;
                  return (
                    <div className="app-card card" key={app._id}>
                      <div className="app-card-header">
                        <div className="app-job-info">
                          <div className="company-logo-sm">{app.job?.company?.charAt(0)}</div>
                          <div>
                            <h3 className="app-job-title">{app.job?.title}</h3>
                            <p className="app-company">{app.job?.company} · {app.job?.location}</p>
                          </div>
                        </div>
                        <div className="app-status-area">
                          <span className={`badge ${sc.color}`}>{sc.icon} {sc.label}</span>
                          {app.aiAnalysis?.matchScore && (
                            <div className="mini-score" style={{ color: app.aiAnalysis.matchScore >= 70 ? '#34d399' : app.aiAnalysis.matchScore >= 40 ? '#fbbf24' : '#f87171' }}>
                              🎯 {app.aiAnalysis.matchScore}/100
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="app-card-body">
                        <div className="app-tags">
                          <span className="badge badge-gray">{app.job?.jobType}</span>
                          <span className="text-xs text-muted">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>

                        {app.aiAnalysis?.matchScore !== undefined ? (
                          <button className="btn btn-secondary btn-sm mt-1" onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}>
                            {selectedApp?._id === app._id ? '▲ Hide Analysis' : '🤖 View Analysis'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm mt-1"
                            onClick={() => handleAnalyze(app._id)}
                            disabled={analyzing}
                            title={!app.resume ? 'No resume attached — analysis will use job description only' : 'Run AI analysis'}
                          >
                            {analyzing ? <><span className="spinner" /> Analyzing...</> : '🤖 Run Analysis'}
                          </button>
                        )}

                        {selectedApp?._id === app._id && <AnalysisCard analysis={app.aiAnalysis} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="dash-section">
            <div className="resume-upload-zone">
              <div className="upload-icon">📄</div>
              <h3>Upload Your Resume</h3>
              <p>PDF or Word document · Max 10MB</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: '0.25rem' }}>🤖 AI will auto-extract your skills!</p>
              <label className="btn btn-primary mt-2" style={{ cursor: 'pointer' }}>
                {uploading ? <><span className="spinner" /> Uploading...</> : '📤 Upload Resume'}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>

            {resumes.length > 0 && (
              <div className="resumes-grid mt-3">
                {resumes.map((r) => (
                  <div className="resume-item card" key={r._id}>
                    <div className="resume-icon">📄</div>
                    <div className="resume-info">
                      <div className="resume-name">{r.fileName}</div>
                      <div className="resume-meta">
                        {(r.fileSize / 1024).toFixed(1)} KB · {new Date(r.createdAt).toLocaleDateString()}
                        {r.isDefault && <span className="badge badge-primary" style={{ marginLeft: 8 }}>Default</span>}
                      </div>
                      {r.parsedData?.extractedSkills?.length > 0 && (
                        <div className="skill-chips mt-1">
                          {r.parsedData.extractedSkills.slice(0, 6).map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
                          {r.parsedData.extractedSkills.length > 6 && <span className="skill-chip">+{r.parsedData.extractedSkills.length - 6}</span>}
                        </div>
                      )}
                    </div>
                    <div className="resume-actions">
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">👁 View</a>
                      {!r.isDefault && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSetDefault(r._id)}>⭐ Set Default</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteResume(r._id)}>🗑</button>
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
              <h3>👤 Your Profile</h3>
              <div className="profile-grid mt-2">
                {[
                  { label: 'Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone || '—' },
                  { label: 'Location', value: user?.location || '—' },
                  { label: 'Experience', value: user?.experience ? `${user.experience} years` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="profile-field">
                    <div className="profile-field-label">{label}</div>
                    <div className="profile-field-value">{value}</div>
                  </div>
                ))}
              </div>
              {user?.skills?.length > 0 && (
                <div className="mt-2">
                  <div className="form-label">Your Skills</div>
                  <div className="skill-chips mt-1">
                    {user.skills.map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
                  </div>
                </div>
              )}
              <Link to="/seeker/profile" className="btn btn-primary mt-3">✏️ Edit Profile</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
