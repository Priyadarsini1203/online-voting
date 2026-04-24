import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/results')
      .then(res => {
        const grouped = res.data.reduce((acc, c) => {
          if (!acc[c.position]) acc[c.position] = [];
          acc[c.position].push(c);
          return acc;
        }, {});
        setResults(Object.entries(grouped));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 font-bold animate-pulse">Calculating Results...</div>;

  return (
    <div className="space-y-12 animate-fade">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <BarChart3 className="text-primary" /> Live Results
        </h1>
        <p className="text-text-muted">Real-time vote tallies and candidate standings.</p>
      </div>

      <div className="space-y-16">
        {results.map(([pos, candidates]) => {
          const maxVotes = Math.max(...candidates.map(c => c.votes_count));
          const totalPosVotes = candidates.reduce((s, c) => s + c.votes_count, 0);

          return (
            <div key={pos} className="space-y-8">
              <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">{pos} Standings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {candidates.map(cand => {
                  const percentage = totalPosVotes > 0 ? ((cand.votes_count / totalPosVotes) * 100).toFixed(1) : 0;
                  const isWinner = cand.votes_count === maxVotes && maxVotes > 0;

                  return (
                    <div key={cand.id} className={`glass-card relative overflow-hidden transition-all ${isWinner ? 'border-primary/50 bg-primary/10' : ''}`}>
                      {isWinner && <div className="absolute top-4 right-4 text-yellow-400"><Trophy size={24} /></div>}
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{cand.name}</h3>
                          <p className="text-text-muted text-sm">{cand.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{cand.votes_count}</p>
                          <p className="text-xs font-bold text-text-muted uppercase">Votes</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-text-muted">
                          <span>Support Level</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full ${isWinner ? 'bg-primary' : 'bg-text-muted/50'}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Results;
