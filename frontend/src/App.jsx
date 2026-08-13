import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ApplicationsPage from './pages/ApplicationsPage';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Shared Components
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';

// Route Guards
const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="logo-anim">⚡</div><div className="spinner spinner-lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="logo-anim">⚡</div><div className="spinner spinner-lg" /></div>;
  if (user) return <Navigate to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard'} replace />;
  return children;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Job Seeker */}
        <Route path="/seeker/dashboard" element={<PrivateRoute allowedRole="jobseeker"><JobSeekerDashboard /></PrivateRoute>} />
        <Route path="/seeker/profile" element={<PrivateRoute allowedRole="jobseeker"><Profile /></PrivateRoute>} />

        {/* Recruiter */}
        <Route path="/recruiter/dashboard" element={<PrivateRoute allowedRole="recruiter"><RecruiterDashboard /></PrivateRoute>} />
        <Route path="/recruiter/post-job" element={<PrivateRoute allowedRole="recruiter"><PostJob /></PrivateRoute>} />
        <Route path="/recruiter/jobs/:jobId/applications" element={<PrivateRoute allowedRole="recruiter"><ApplicationsPage /></PrivateRoute>} />
        <Route path="/recruiter/profile" element={<PrivateRoute allowedRole="recruiter"><Profile /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
