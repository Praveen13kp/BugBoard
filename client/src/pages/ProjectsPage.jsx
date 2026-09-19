import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiListProjects } from '../api/projects';
import { useAuth } from '../context/AuthContext';
import { canCreateProject } from '../utils/permissions';
import CreateProjectForm from '../components/projects/CreateProjectForm';
import EmptyState from '../components/common/EmptyState';
import ErrorBox from '../components/common/ErrorBox';
import Loading from '../components/common/Loading';
import SuccessBox from '../components/common/SuccessBox';

export default function ProjectsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.success ?? '');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const isAdmin = canCreateProject(user.role);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { projects: list } = await apiListProjects();
      setProjects(list);
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load projects.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <section className="page-heading page-heading--row">
        <div>
          <h2>Projects</h2>
          <p className="muted">Projects you can access.</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn--primary" onClick={() => setShowCreate((visible) => !visible)}>
            {showCreate ? 'Cancel' : 'New project'}
          </button>
        )}
      </section>

      {showCreate && isAdmin && <CreateProjectForm onCreated={load} />}

      <SuccessBox message={successMessage} onDismiss={() => setSuccessMessage('')} />

      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : loading ? (
        <Loading text="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message={
            isAdmin
              ? 'Create your first project to start tracking issues.'
              : 'You are not a member of any project yet. Contact an administrator.'
          }
        />
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              <div className="project-card-head">
                <span className="project-key">{project.key}</span>
                <span className="badge">{project.memberCount} member{project.memberCount === 1 ? '' : 's'}</span>
              </div>
              <h3 className="project-card-title">{project.name}</h3>
              <p className="project-card-desc">{project.description || 'No description provided.'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}