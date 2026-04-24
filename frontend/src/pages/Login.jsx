import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ student_id: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10 animate-fade">
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-8 text-center">Student Sign In</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Student ID</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              placeholder="e.g. STU123"
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-4 text-lg">Sign In</button>
        </form>
        <p className="mt-8 text-center text-text-muted">
          New voter? <Link to="/signup" className="text-primary font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
