import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canReportIssueForProject } from '../../utils/permissions';
import { apiListProjects } from '../../api/projects';
import Header from './Header';
import LoadingScreen from '../common/LoadingScreen';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canReport, setCanReport] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    apiListProjects()
      .then(({ projects: list }) => {
        if (active) {
          setCanReport(
            user.role === 'ADMIN' || list.some((project) => canReportIssueForProject(user, project)),
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (initializing) return <LoadingScreen text="Restoring your session..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenu={() => setSidebarOpen(true)} canReport={canReport} />
        <main className="content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}