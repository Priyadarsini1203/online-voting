import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ student_id: '', name: '', password: '', department: '', year: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-10 animate-fade">
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-8 text-center">Voter Registration</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Full Name</label>
              <input type="text" required className="input-field" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Student ID</label>
              <input type="text" required className="input-field" onChange={(e) => setFormData({...formData, student_id: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Department</label>
              <input type="text" required className="input-field" onChange={(e) => setFormData({...formData, department: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Year</label>
              <input type="text" required className="input-field" onChange={(e) => setFormData({...formData, year: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Password</label>
            <input type="password" required className="input-field" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full py-4 text-lg">Create Account</button>
        </form>
        <p className="mt-8 text-center text-text-muted">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
