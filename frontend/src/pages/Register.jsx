import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: searchParams.get('role') || 'jobseeker',
    company: '', phone: '', location: '', skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(`Account created! Welcome, ${data.user.name.split(' ')[0]}! 🎉`);
      navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card auth-card-wide animate-fadeInUp">
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h2>Create Account</h2>
          <p>Join the AI-powered job portal</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${form.role === 'jobseeker' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'jobseeker' })}
          >🎯 Job Seeker</button>
          <button
            type="button"
            className={`role-btn ${form.role === 'recruiter' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'recruiter' })}
          >🏢 Recruiter</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="form-input" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Mumbai, India" className="form-input" />
            </div>
            {form.role === 'recruiter' ? (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Tech Corp Ltd." className="form-input" required />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Your Skills (comma separated)</label>
                <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python..." className="form-input" />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? <><span className="spinner" /> Creating Account...</> : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
