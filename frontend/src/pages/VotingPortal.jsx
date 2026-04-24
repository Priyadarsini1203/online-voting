import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShieldCheck, Info } from 'lucide-react';

const VotingPortal = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingManifesto, setViewingManifesto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCan, resSet] = await Promise.all([
          axios.get('http://localhost:5000/api/candidates'),
          axios.get('http://localhost:5000/api/settings')
        ]);
        if (resSet.data.election_status !== 'live') navigate('/');
        setCandidates(resCan.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleVote = (pos, id) => setSelected({ ...selected, [pos]: id });

  const submitBallot = async () => {
    const positions = [...new Set(candidates.map(c => c.position))];
    if (Object.keys(selected).length < positions.length) {
      alert('Please select a candidate for all positions');
      return;
    }

    setIsSubmitting(true);
    const voteData = Object.entries(selected).map(([pos, id]) => ({ candidateId: id, position: pos }));
    try {
      await axios.post('http://localhost:5000/api/vote', { userId: user.id, candidateVotes: voteData });
      login({ ...user, has_voted: true });
      navigate('/results');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading candidates...</div>;

  const positions = [...new Set(candidates.map(c => c.position))];

  return (
    <div className="space-y-16 animate-fade relative">
      {viewingManifesto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full animate-fade space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{viewingManifesto.name}</h3>
                <p className="text-primary font-bold text-sm uppercase tracking-widest">{viewingManifesto.position}</p>
              </div>
              <button onClick={() => setViewingManifesto(null)} className="text-text-muted hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <p className="text-text-muted leading-relaxed">
                "I am committed to enhancing student life through transparent leadership and better campus facilities. 
                Vote for progress and unity."
              </p>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Department</p>
                <p className="font-bold">{viewingManifesto.department}</p>
              </div>
            </div>
            <button 
              onClick={() => { handleVote(viewingManifesto.position, viewingManifesto.id); setViewingManifesto(null); }}
              className="btn-primary w-full"
            >
              Select this Candidate
            </button>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto space-y-6">
        <h1 className="text-5xl font-black tracking-tighter">Cast Your Vote</h1>
        <p className="text-text-muted text-lg">Select the most deserving candidate for each council position.</p>
        <div className="relative max-w-md mx-auto">
          <input 
            type="text" 
            placeholder="Search candidates by name..." 
            className="input-field !pl-12 !rounded-full !py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card !p-4 !rounded-2xl border-primary/20 flex items-center justify-center gap-3 text-primary bg-primary/5 mx-auto max-w-md">
        <ShieldCheck size={18} />
        <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Secure Voting Session Active</span>
      </div>

      <div className="space-y-20">
        {positions.map(pos => (
          <div key={pos} className="space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold tracking-tight whitespace-nowrap">{pos}</h2>
              <div className="h-px w-full bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates
                .filter(c => c.position === pos && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(cand => (
                <div 
                  key={cand.id}
                  onClick={() => handleVote(pos, cand.id)}
                  className={`glass-card !p-6 cursor-pointer transition-all duration-300 border-2 ${
                    selected[pos] === cand.id 
                      ? 'border-primary bg-primary/10 scale-[1.02] shadow-2xl shadow-primary/10' 
                      : 'border-transparent hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                      selected[pos] === cand.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'
                    }`}>
                      {cand.name[0]}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight">{cand.name}</h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingManifesto(cand); }}
                          className="p-1 hover:bg-white/10 rounded-md text-primary transition-colors"
                          title="View Manifesto"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">{cand.department}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected[pos] === cand.id ? 'border-primary bg-primary' : 'border-white/10'
                    }`}>
                      {selected[pos] === cand.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 pt-16 border-t border-white/5">
        <div className="flex items-center gap-3 text-text-muted bg-white/5 px-6 py-3 rounded-full border border-white/5">
          <Info size={14} className="text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Final verification required before casting</p>
        </div>
        <button 
          onClick={submitBallot}
          disabled={isSubmitting}
          className={`btn-primary px-24 py-5 text-xl !rounded-full shadow-2xl hover:shadow-primary/40 ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? 'Processing Vote...' : 'Cast My Final Ballot'}
        </button>
      </div>
    </div>
  );
};

export default VotingPortal;
