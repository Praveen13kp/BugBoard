import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import CreateIssuePage from '../pages/CreateIssuePage';
import DashboardPage from '../pages/DashboardPage';
import IssueDetailPage from '../pages/IssueDetailPage';
import IssuesPage from '../pages/IssuesPage';
import LoginPage from '../pages/LoginPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import ProjectsPage from '../pages/ProjectsPage';
import RegisterPage from '../pages/RegisterPage';
import GuestRoute from './GuestRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:issueId" element={<IssueDetailPage />} />
        <Route path="/create-issue" element={<CreateIssuePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}