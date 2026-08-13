import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/', { replace: true });
  };

  const dashboardLink = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard';
  const profileLink = user?.role === 'recruiter' ? '/recruiter/profile' : '/seeker/profile';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">Job<span className="logo-accent">AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/jobs" className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}>
            Browse Jobs
          </Link>
          {user?.role === 'recruiter' && (
            <>
              <Link
                to="/recruiter/dashboard"
                className={`nav-link ${location.pathname.includes('/recruiter/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">+ Post Job</Link>
            </>
          )}
          {user?.role === 'jobseeker' && (
            <Link
              to="/seeker/dashboard"
              className={`nav-link ${location.pathname.includes('/seeker/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Area */}
        <div className="navbar-auth">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            /* ── User Dropdown ── */
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="user-info-mini">
                  <span className="user-name-mini">{user.name?.split(' ')[0]}</span>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'recruiter' ? '🏢 Recruiter' : '🎯 Job Seeker'}
                  </span>
                </div>
                <span className="dropdown-arrow" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                    to={dashboardLink}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to={profileLink}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <div className="dropdown-divider" />
                  {/* Use onMouseDown instead of onClick so it fires before the blur/outside-click handler */}
                  <button
                    className="dropdown-item danger"
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent dropdown from closing before click
                      handleLogout();
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'transform 0.2s' }} />
            <span style={{ opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/jobs" className="mobile-link" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {user ? (
            <>
              <Link to={dashboardLink} className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to={profileLink} className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === 'recruiter' && (
                <Link to="/recruiter/post-job" className="mobile-link" onClick={() => setMenuOpen(false)}>Post Job</Link>
              )}
              <button className="mobile-link danger" onClick={handleLogout}>🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
