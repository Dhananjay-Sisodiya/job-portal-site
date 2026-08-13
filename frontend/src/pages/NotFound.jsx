import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
    <div style={{ fontSize: '6rem', lineHeight: 1 }}>🔮</div>
    <h1 style={{ fontSize: '4rem', fontFamily: 'Outfit', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
    <h2>Page Not Found</h2>
    <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>The page you're looking for doesn't exist. Let's get you back on track.</p>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/" className="btn btn-primary btn-lg">🏠 Go Home</Link>
      <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
    </div>
  </div>
);

export default NotFound;
