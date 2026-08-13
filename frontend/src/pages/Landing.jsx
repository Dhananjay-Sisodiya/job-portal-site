import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const stats = [
  { icon: '💼', value: '10,000+', label: 'Active Jobs' },
  { icon: '🏢', value: '2,500+', label: 'Companies' },
  { icon: '👥', value: '50,000+', label: 'Job Seekers' },
  { icon: '🤖', value: '98%', label: 'AI Accuracy' },
];

const features = [
  { icon: '🎯', title: 'AI Resume Scoring', desc: 'Gemini AI analyzes your resume against job descriptions and gives a match score from 0–100.' },
  { icon: '🔍', title: 'Skill Gap Analysis', desc: 'Identify exactly which skills you\'re missing and get actionable recommendations to improve.' },
  { icon: '📝', title: 'AI Job Description Generator', desc: 'Recruiters can generate professional, ATS-optimized job descriptions with a single click.' },
  { icon: '⚡', title: 'Smart Matching', desc: 'NLP-powered keyword extraction matches your profile with the most relevant opportunities.' },
  { icon: '📊', title: 'Role Dashboards', desc: 'Separate, feature-rich dashboards for Job Seekers and Recruiters.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, role-based access control, and encrypted data handling.' },
];

const steps = [
  { step: '01', role: 'Job Seeker', icon: '👤', title: 'Create Your Profile', desc: 'Sign up and upload your resume. Our AI instantly parses it and extracts your skills.' },
  { step: '02', role: 'Job Seeker', icon: '🔍', title: 'Browse & Apply', desc: 'Search jobs by title, location, or skills. Apply with one click using your stored resume.' },
  { step: '03', role: 'Job Seeker', icon: '🤖', title: 'Get AI Insights', desc: 'Receive a match score, missing skills, and specific suggestions to improve your chances.' },
  { step: '04', role: 'Recruiter', icon: '📋', title: 'Post Jobs with AI', desc: 'Generate a complete job description using Gemini AI — just enter title and skills.' },
];

const Landing = () => {
  return (
    <main className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />
        <div className="container hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span>🤖</span>
            <span>Powered by Google Gemini AI</span>
          </div>
          <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Find Your Dream Job<br />
            <span className="text-gradient">with AI Precision</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            The only job portal with AI-powered resume analysis, skill gap detection,
            and intelligent matching. Get hired faster with Gemini AI insights.
          </p>
          <div className="hero-cta animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="btn btn-primary btn-lg">🚀 Get Started Free</Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
          </div>
          <div className="hero-roles animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <Link to="/register?role=jobseeker" className="role-pill">🎯 I'm a Job Seeker</Link>
            <Link to="/register?role=recruiter" className="role-pill">🏢 I'm a Recruiter</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section section">
        <div className="container">
          <div className="text-center mb-3">
            <div className="section-badge">✨ Features</div>
            <h2>Everything You Need to <span className="text-gradient">Succeed</span></h2>
            <p style={{ maxWidth: 600, margin: '1rem auto 0' }}>Built with cutting-edge AI, our platform gives both job seekers and recruiters a competitive edge.</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section section">
        <div className="container">
          <div className="text-center mb-3">
            <div className="section-badge">🔄 Process</div>
            <h2>How It <span className="text-gradient">Works</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step-card" key={s.step}>
                <div className="step-num">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-role">{s.role}</div>
                <h3>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-orb" />
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of professionals using AI to land their dream jobs.</p>
            <div className="hero-cta" style={{ marginTop: '2rem' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Start for Free Today</Link>
              <Link to="/jobs" className="btn btn-secondary btn-lg">Explore Jobs</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
