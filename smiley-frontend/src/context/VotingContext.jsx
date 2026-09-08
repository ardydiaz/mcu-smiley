import { createContext, useCallback, useMemo, useState } from 'react';

const initialState = {
  rating: null,
  userType: null,
  feedback: '',
};

export const VotingContext = createContext(null);

export function VotingProvider({ children }) {
  const [vote, setVote] = useState(initialState);

  const updateVote = useCallback(values => {
    setVote(current => ({ ...current, ...values }));
  }, []);

  const resetVote = useCallback(() => setVote(initialState), []);

  const value = useMemo(() => ({ vote, updateVote, resetVote }), [vote, updateVote, resetVote]);
  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>;
}
