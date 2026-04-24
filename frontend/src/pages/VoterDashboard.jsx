import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, AlertCircle, Building, Calendar, Hash } from 'lucide-react';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [electionStatus, setElectionStatus] = useState('stopped');

  useEffect(() => {
    axios.get('http://localhost:5000/api/settings')
      .then(res => setElectionStatus(res.data.election_status))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-fade">
      <div className="glass-card flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">{user.name[0]}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-text-muted font-medium">Voter ID: {user.student_id}</p>
          </div>
        </div>
        <div className="flex gap-4">
          {user.has_voted ? (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-6 py-3 rounded-2xl border border-green-400/20 font-bold">
              <CheckCircle2 size={20} />
              Vote Cast
            </div>
          ) : electionStatus === 'live' ? (
            <Link to="/vote" className="btn-primary px-10 py-4 text-lg">Enter Voting Portal</Link>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-6 py-3 rounded-2xl border border-yellow-400/20 font-bold">
              <AlertCircle size={20} />
              Election Stopped
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl"><Building className="text-primary" /></div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Department</p>
            <p className="text-lg font-bold">{user.department}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl"><Calendar className="text-primary" /></div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Academic Year</p>
            <p className="text-lg font-bold">{user.year}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl"><Hash className="text-primary" /></div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Status</p>
            <p className="text-lg font-bold">{user.has_voted ? 'Voted' : 'Eligible'}</p>
          </div>
        </div>
      </div>

      <div className="glass-card border-l-4 border-l-primary bg-primary/5">
        <h3 className="text-xl font-bold mb-2">Student Council 2024</h3>
        <p className="text-text-muted">Participation in college elections is your right and responsibility. Ensure you review all candidates before casting your final ballot.</p>
      </div>
    </div>
  );
};

export default VoterDashboard;
