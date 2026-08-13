import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)',
    padding: '3rem 0 1.5rem', marginTop: 'auto'
  }}>
    <div className="container">
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem' }}>Job<span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 220 }}>
            AI-powered job portal connecting talent with opportunity using Gemini AI.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>For Job Seekers</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/jobs" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Browse Jobs</Link>
            <Link to="/register" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Create Profile</Link>
            <Link to="/seeker/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>For Recruiters</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/recruiter/post-job" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Post a Job</Link>
            <Link to="/recruiter/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dashboard</Link>
            <Link to="/register" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign Up</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>AI Features</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>🤖 Resume Analysis</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📝 JD Generator</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>🎯 Skill Gap Analysis</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2024 Job AI Powder. Powered by Gemini AI.</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['🔵 Privacy', '📋 Terms', '📧 Contact'].map((item) => (
            <span key={item} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
