import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import './Jobs.css';

const JOB_TYPES = ['', 'full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['', 'entry', 'mid', 'senior', 'lead', 'executive'];

const JobCard = ({ job }) => {
  const salaryText = job.salaryMin
    ? `₹${(job.salaryMin / 100000).toFixed(1)}–${(job.salaryMax / 100000).toFixed(1)} LPA`
    : 'Salary not disclosed';

  const statusColor = job.applicationDeadline && new Date(job.applicationDeadline) < new Date()
    ? 'badge-danger' : 'badge-success';

  return (
    <Link to={`/jobs/${job._id}`} className="job-card card">
      <div className="job-card-header">
        <div className="company-logo">{job.company?.charAt(0).toUpperCase()}</div>
        <div className="job-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company} · {job.location}</p>
        </div>
        <div className={`badge ${statusColor}`}>
          {job.applicationDeadline && new Date(job.applicationDeadline) < new Date() ? 'Closed' : 'Active'}
        </div>
      </div>
      <div className="job-tags">
        <span className="badge badge-primary">{job.jobType}</span>
        <span className="badge badge-info">{job.experienceLevel}</span>
        <span className="badge badge-warning">{salaryText}</span>
      </div>
      <p className="job-desc">{job.description?.substring(0, 130)}...</p>
      <div className="job-skills">
        {job.requiredSkills?.slice(0, 4).map((s) => (
          <span key={s} className="tag">{s}</span>
        ))}
        {job.requiredSkills?.length > 4 && <span className="tag">+{job.requiredSkills.length - 4}</span>}
      </div>
      <div className="job-card-footer">
        <span className="job-views">👁 {job.views || 0} views</span>
        <span className="job-date">{new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span className="btn btn-primary btn-sm">View Job →</span>
      </div>
    </Link>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    skills: searchParams.get('skills') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await jobsAPI.getAll(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => setFilters({ search: '', location: '', jobType: '', experienceLevel: '', skills: '', page: 1 });

  return (
    <div className="jobs-page">
      <div className="jobs-hero">
        <div className="container">
          <h1>Find Your <span className="text-gradient">Perfect Role</span></h1>
          <p>Browse {total.toLocaleString()} active job listings</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              className="form-input search-input" type="text" name="search"
              value={filters.search} onChange={handleFilter}
              placeholder="Search by title, company, or skill..."
            />
            <input
              className="form-input search-input" type="text" name="location"
              value={filters.location} onChange={handleFilter} placeholder="Location"
              style={{ maxWidth: 200 }}
            />
            <button type="submit" className="btn btn-primary">🔍 Search</button>
          </form>
        </div>
      </div>

      <div className="container jobs-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Job Type</label>
            <select name="jobType" value={filters.jobType} onChange={handleFilter} className="form-select">
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t || 'All Types'}</option>)}
            </select>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Experience Level</label>
            <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilter} className="form-select">
              {EXP_LEVELS.map((l) => <option key={l} value={l}>{l || 'All Levels'}</option>)}
            </select>
          </div>

          <div className="form-group mt-2">
            <label className="form-label">Skills</label>
            <input
              className="form-input" name="skills" value={filters.skills}
              onChange={handleFilter} placeholder="React, Python..."
            />
          </div>

          <div className="filter-stats mt-3">
            <div className="stat-pill">📋 {total} jobs found</div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="jobs-list">
          {loading ? (
            <div className="flex-center" style={{ minHeight: 300, flexDirection: 'column', gap: '1rem' }}>
              <div className="spinner spinner-lg" />
              <p className="text-muted">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '4rem' }}>🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters</p>
              <button className="btn btn-primary mt-2" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-count">
                Showing <strong>{jobs.length}</strong> of <strong>{total}</strong> jobs
              </div>
              <div className="jobs-grid">
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
