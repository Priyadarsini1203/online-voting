import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Play, Square, Trash2, Search, ListChecks } from 'lucide-react';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [stats, setStats] = useState({ totalRegistered: 0, votesPolled: 0 });
  const [electionStatus, setElectionStatus] = useState('stopped');
  const [search, setSearch] = useState('');
  const [newCandidate, setNewCandidate] = useState({ name: '', position: '', department: '', image_url: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    const [resCan, resVot, resStat, resSet] = await Promise.all([
      axios.get('http://localhost:5000/api/candidates'),
      axios.get('http://localhost:5000/api/voters'),
      axios.get('http://localhost:5000/api/stats'),
      axios.get('http://localhost:5000/api/settings')
    ]);
    setCandidates(resCan.data);
    setVoters(resVot.data);
    setStats(resStat.data);
    setElectionStatus(resSet.data.election_status);
  };

  useEffect(() => { fetchData(); }, []);

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/candidates', newCandidate);
      setNewCandidate({ name: '', position: '', department: '', image_url: '' });
      setMessage({ text: 'Candidate registered successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Failed to add candidate.', type: 'error' });
    }
  };

  const deleteCandidate = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/candidates/${id}`);
      setMessage({ text: 'Candidate deleted.', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Delete failed.', type: 'error' });
    }
  };

  const toggleElection = async () => {
    try {
      const nextStatus = electionStatus === 'live' ? 'stopped' : 'live';
      await axios.post('http://localhost:5000/api/settings', { election_status: nextStatus });
      setElectionStatus(nextStatus);
      setMessage({ text: `Election ${nextStatus.toUpperCase()}!`, type: 'success' });
    } catch (err) {
      setMessage({ text: 'Status update failed.', type: 'error' });
    }
  };

  const filteredVoters = voters.filter(v => v.student_id.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-fade">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="text-text-muted">Manage election lifecycle and participants.</p>
        </div>
        <button 
          onClick={toggleElection}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${
            electionStatus === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {electionStatus === 'live' ? <Square size={20} /> : <Play size={20} />}
          {electionStatus === 'live' ? 'Stop Election' : 'Start Election'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl animate-fade ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm font-bold text-text-muted uppercase">Turnout</p>
          <p className="text-3xl font-bold">{stats.totalRegistered > 0 ? ((stats.votesPolled / stats.totalRegistered) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-bold text-text-muted uppercase">Total Votes</p>
          <p className="text-3xl font-bold">{stats.votesPolled}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-bold text-text-muted uppercase">Voters</p>
          <p className="text-3xl font-bold">{stats.totalRegistered}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-primary">
          <p className="text-sm font-bold text-text-muted uppercase">Status</p>
          <p className={`text-xl font-bold ${electionStatus === 'live' ? 'text-green-400' : 'text-red-400'}`}>{electionStatus.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><UserPlus /> Add Candidate</h2>
          <form onSubmit={addCandidate} className="space-y-4">
            <input type="text" placeholder="Name" required className="input-field" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} />
            <input type="text" placeholder="Position" required className="input-field" value={newCandidate.position} onChange={e => setNewCandidate({...newCandidate, position: e.target.value})} />
            <input type="text" placeholder="Department" required className="input-field" value={newCandidate.department} onChange={e => setNewCandidate({...newCandidate, department: e.target.value})} />
            <button className="btn-primary w-full py-4">Register Candidate</button>
          </form>
          <div className="space-y-3 pt-6 border-t border-white/5">
            {candidates.map(c => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-text-muted">{c.position} - {c.department}</p>
                </div>
                <button onClick={() => deleteCandidate(c.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users /> Voter Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input type="text" placeholder="Search ID..." className="input-field pl-10 py-2 text-sm w-48" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-white/5">
                  <th className="pb-4">Student ID</th>
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredVoters.map(v => (
                  <tr key={v.student_id} className="border-b border-white/5">
                    <td className="py-4 font-mono text-primary">{v.student_id}</td>
                    <td className="py-4">{v.name}</td>
                    <td className="py-4">
                      <span className={`badge ${v.has_voted ? 'badge-live' : 'badge-stopped'}`}>
                        {v.has_voted ? 'Voted' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
