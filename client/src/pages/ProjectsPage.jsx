import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import { errorMessage } from '../api/error';
import { apiListProjects } from '../api/projects';
import { useAuth } from '../context/AuthContext';
import { canCreateProject } from '../utils/permissions';
import CreateProjectForm from '../components/projects/CreateProjectForm';
import EmptyState from '../components/common/EmptyState';
import ErrorBox from '../components/common/ErrorBox';
import Modal from '../components/common/Modal';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectsSkeleton from '../components/projects/ProjectsSkeleton';

const PROJECT_TONES = [
  { bg: 'var(--brand-050)', fg: 'var(--brand-700)' },
  { bg: 'var(--info-050)', fg: 'var(--info-600)' },
  { bg: 'var(--success-050)', fg: 'var(--success-600)' },
  { bg: 'var(--warning-050)', fg: 'var(--warning-600)' },
  { bg: 'var(--danger-050)', fg: 'var(--danger-600)' },
];

function toneForKey(key) {
  if (!key) return PROJECT_TONES[0];
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PROJECT_TONES[hash % PROJECT_TONES.length];
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const location = useLocation();
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

  useEffect(() => {
    if (location.state?.success) {
      setShowCreate(false);
      load();
    }
  }, [location.state, load]);

  return (
    <div className="page">
      <section className="page-heading page-heading--row">
        <div>
          <h2>Projects</h2>
          <p>Projects you can access, and the issues inside them.</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <FolderPlus size={17} aria-hidden="true" /> New project
          </button>
        )}
      </section>

      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : loading ? (
        <ProjectsSkeleton count={6} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message={
            isAdmin
              ? 'Create your first project to start tracking issues.'
              : 'You are not a member of any project yet. Contact an administrator.'
          }
          icon={FolderPlus}
        >
          {isAdmin && (
            <button type="button" className="btn btn--primary" onClick={() => setShowCreate(true)}>
              <FolderPlus size={16} aria-hidden="true" /> Create project
            </button>
          )}
        </EmptyState>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} tone={toneForKey(project.key)} />
          ))}
        </div>
      )}

      {showCreate && isAdmin && (
        <Modal title="Create a new project" onClose={() => setShowCreate(false)}>
          <CreateProjectForm onCreated={load} onClose={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  );
}