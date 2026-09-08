import { useContext } from 'react';
import { VotingContext } from '../context/VotingContext.jsx';

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) throw new Error('useVoting must be used inside VotingProvider');
  return context;
}
