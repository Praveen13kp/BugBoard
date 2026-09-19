import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

export default function GuestRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen text="Restoring your session..." />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}