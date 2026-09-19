import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import LoadingScreen from '../common/LoadingScreen';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingScreen text="Restoring your session..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}