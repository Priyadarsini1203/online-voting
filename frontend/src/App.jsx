import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VoterDashboard from './pages/VoterDashboard';
import VotingPortal from './pages/VotingPortal';
import AdminDashboard from './pages/AdminDashboard';
import Results from './pages/Results';
import { Vote, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0f1d] border-b border-white/5 py-4 px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold no-underline">
          <Vote className="text-primary" />
          <span className="text-white">College<span className="text-primary">Vote</span></span>
        </Link>
        
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/results" className="nav-link">Results</Link>
            {user?.role === 'admin' && <Link to="/admin" className="nav-link text-primary font-bold">Admin Panel</Link>}
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <span className="hidden md:inline text-sm font-bold text-white">{user.name}</span>
                <button onClick={logout} className="text-red-400 hover:text-red-300">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-6 rounded-full text-sm">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen pt-24 pb-20">
          <Navbar />
          <div className="main-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><VoterDashboard /></ProtectedRoute>} />
              <Route path="/vote" element={<ProtectedRoute><VotingPortal /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
