import { AuthProvider } from './context/AuthContext.jsx';
import { VotingProvider } from './context/VotingContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <VotingProvider>
        <AppRoutes />
      </VotingProvider>
    </AuthProvider>
  );
}
