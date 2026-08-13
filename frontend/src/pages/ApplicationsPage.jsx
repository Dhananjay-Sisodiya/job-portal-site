import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Applications.css';

const statusOptions = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];
const statusColors = {
  pending: 'badge-warning', reviewing: 'badge-info', shortlisted: 'badge-primary',
  accepted: 'badge-success', rejected: 'badge-danger',
};

const ScoreMeter = ({ score }) => {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color, minWidth: 36 }}>{score}</span>
    </div>
  );
};

const ApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, [jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationsAPI.getJobApplications(jobId);
      setApplications(data.applications);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationsAPI.updateStatus(appId, { status });
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
      if (selectedApp?._id === appId) setSelectedApp((a) => ({ ...a, status }));
      toast.success(`Candidate ${status}!`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAnalyze = async (appId) => {
    setAnalyzingId(appId);
    try {
      const { data } = await applicationsAPI.analyze(appId);
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, aiAnalysis: data.aiAnalysis } : a));
      if (selectedApp?._id === appId) setSelectedApp((a) => ({ ...a, aiAnalysis: data.aiAnalysis }));
      toast.success('🤖 AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="applications-page">
      <div className="container">
        <div className="apps-header">
          <div>
            <h1>👥 Candidates</h1>
            <p>{applications.length} applications received</p>
          </div>
          <div className="apps-filter">
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 180 }}>
              <option value="all">All Statuses ({applications.length})</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} ({applications.filter((a) => a.status === s).length})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="apps-layout">
          {/* Candidate List */}
          <div className="candidates-list">
            {filtered.length === 0 ? (
              <div className="empty-state card"><p>No candidates found</p></div>
            ) : filtered.map((app) => (
              <div
                key={app._id}
                className={`candidate-card card ${selectedApp?._id === app._id ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="candidate-header">
                  <div className="candidate-avatar">{app.applicant?.name?.charAt(0)}</div>
                  <div className="candidate-info">
                    <div className="candidate-name">{app.applicant?.name}</div>
                    <div className="candidate-meta">{app.applicant?.email}</div>
                    {app.applicant?.location && <div className="candidate-meta">📍 {app.applicant.location}</div>}
                  </div>
                  <span className={`badge ${statusColors[app.status]}`}>{app.status}</span>
                </div>

                {app.aiAnalysis?.matchScore !== undefined && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>AI Match Score</div>
                    <ScoreMeter score={app.aiAnalysis.matchScore} />
                  </div>
                )}

                {app.applicant?.skills?.length > 0 && (
                  <div className="skill-chips" style={{ marginTop: '0.6rem' }}>
                    {app.applicant.skills.slice(0, 4).map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
                    {app.applicant.skills.length > 4 && <span className="skill-chip">+{app.applicant.skills.length - 4}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="candidate-detail">
            {!selectedApp ? (
              <div className="card empty-state">
                <div style={{ fontSize: '3rem' }}>👈</div>
                <h3>Select a Candidate</h3>
                <p>Click on a candidate to view their full profile</p>
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="detail-candidate-header">
                    <div className="detail-avatar">{selectedApp.applicant?.name?.charAt(0)}</div>
                    <div>
                      <h2 style={{ fontSize: '1.3rem' }}>{selectedApp.applicant?.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selectedApp.applicant?.email}</p>
                      {selectedApp.applicant?.phone && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>📞 {selectedApp.applicant.phone}</p>}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="detail-info-grid mt-2">
                    {[
                      { label: 'Location', value: selectedApp.applicant?.location || '—' },
                      { label: 'Experience', value: selectedApp.applicant?.experience ? `${selectedApp.applicant.experience} years` : '—' },
                      { label: 'Education', value: selectedApp.applicant?.education || '—' },
                      { label: 'Applied', value: new Date(selectedApp.appliedAt).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="detail-info-item">
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  {selectedApp.applicant?.skills?.length > 0 && (
                    <div className="mt-2">
                      <div className="form-label">Skills</div>
                      <div className="skill-chips mt-1">
                        {selectedApp.applicant.skills.map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {(selectedApp.applicant?.linkedinUrl || selectedApp.applicant?.githubUrl) && (
                    <div className="flex gap-1 mt-2">
                      {selectedApp.applicant.linkedinUrl && <a href={selectedApp.applicant.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">🔗 LinkedIn</a>}
                      {selectedApp.applicant.githubUrl && <a href={selectedApp.applicant.githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">💻 GitHub</a>}
                    </div>
                  )}

                  {/* Resume */}
                  {selectedApp.resume && (
                    <div className="mt-2">
                      <a href={selectedApp.resume.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        📄 View Resume ({selectedApp.resume.fileName})
                      </a>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedApp.coverLetter && (
                    <div className="mt-2">
                      <div className="form-label">Cover Letter</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '0.5rem' }}>{selectedApp.coverLetter}</p>
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                <div className="card mt-2">
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3>🤖 AI Analysis</h3>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAnalyze(selectedApp._id)}
                      disabled={analyzingId === selectedApp._id}
                    >
                      {analyzingId === selectedApp._id ? <><span className="spinner" /> Analyzing...</> : '🔄 Run Analysis'}
                    </button>
                  </div>

                  {selectedApp.aiAnalysis?.matchScore !== undefined ? (
                    <>
                      <div className="ai-score-display">
                        <div className="big-score" style={{ color: selectedApp.aiAnalysis.matchScore >= 70 ? '#34d399' : selectedApp.aiAnalysis.matchScore >= 40 ? '#fbbf24' : '#f87171' }}>
                          {selectedApp.aiAnalysis.matchScore}<span style={{ fontSize: '1rem', opacity: 0.6 }}>/100</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Overall Match Score</div>
                          <ScoreMeter score={selectedApp.aiAnalysis.matchScore} />
                        </div>
                      </div>

                      {selectedApp.aiAnalysis.strengths?.length > 0 && (
                        <div className="mt-2">
                          <div className="form-label text-success">💪 Strengths</div>
                          <ul className="suggestions-list mt-1">
                            {selectedApp.aiAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {selectedApp.aiAnalysis.matchedSkills?.length > 0 && (
                        <div className="mt-2">
                          <div className="form-label">✅ Matched Skills</div>
                          <div className="skill-chips mt-1">
                            {selectedApp.aiAnalysis.matchedSkills.map((s) => <span key={s} className="skill-chip matched">{s}</span>)}
                          </div>
                        </div>
                      )}

                      {selectedApp.aiAnalysis.missingSkills?.length > 0 && (
                        <div className="mt-2">
                          <div className="form-label">❌ Missing Skills</div>
                          <div className="skill-chips mt-1">
                            {selectedApp.aiAnalysis.missingSkills.map((s) => <span key={s} className="skill-chip missing">{s}</span>)}
                          </div>
                        </div>
                      )}

                      {selectedApp.aiAnalysis.analysisText && (
                        <div className="mt-2 alert alert-info">
                          📝 {selectedApp.aiAnalysis.analysisText}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="alert alert-info">No AI analysis yet. Click "Run Analysis" to generate.</div>
                  )}
                </div>

                {/* Actions */}
                <div className="card mt-2">
                  <h3>✅ Update Status</h3>
                  <div className="status-actions mt-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${selectedApp.status === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleStatusChange(selectedApp._id, s)}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button className="btn btn-success" onClick={() => handleStatusChange(selectedApp._id, 'accepted')}>
                      ✅ Accept Candidate
                    </button>
                    <button className="btn btn-danger" onClick={() => handleStatusChange(selectedApp._id, 'rejected')}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
