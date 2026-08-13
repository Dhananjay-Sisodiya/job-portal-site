import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card animate-fadeInUp">
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your Job AI account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" className="form-input" required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" className="form-input" required minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <div className="or-divider">or continue with</div>
        <div className="demo-logins">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>Demo accounts:</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setForm({ email: 'seeker@demo.com', password: 'demo123' })}>👤 Job Seeker</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setForm({ email: 'recruiter@demo.com', password: 'demo123' })}>🏢 Recruiter</button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up free →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
