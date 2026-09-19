import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiCreateIssue } from '../api/issues';
import { apiGetProject, apiListProjects } from '../api/projects';
import { PRIORITY_LABELS, SEVERITY_LABELS } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function CreateIssuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(searchParams.get('project') || '');
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiListProjects()
      .then(({ projects: list }) => setProjects(list))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) {
      setMembers([]);
      return;
    }
    let active = true;
    apiGetProject(projectId)
      .then(({ project }) => {
        if (active) setMembers(project.members || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [projectId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { issue } = await apiCreateIssue({
        project: projectId,
        title,
        description,
        severity,
        priority,
        assignee: assignee || null,
      });
      navigate(`/issues/${issue.id}`);
    } catch (submitError) {
      setError(errorMessage(submitError, 'Unable to create the issue.'));
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="page-heading">
        <h2>Report an issue</h2>
        <p className="muted">You will be recorded as the reporter.</p>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Project</span>
            <select
              className="input"
              required
              value={projectId}
              onChange={(event) => {
                setProjectId(event.target.value);
                setAssignee('');
              }}
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Assignee</span>
            <select
              className="input"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              disabled={!projectId}
            >
              <option value="">Unassigned</option>
              {members
                .filter((member) => member.id !== user.id)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">Title</span>
          <input
            className="input"
            required
            minLength={3}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Short, descriptive bug title"
          />
        </label>

        <label className="field">
          <span className="field-label">Description</span>
          <textarea
            className="input"
            required
            minLength={3}
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Steps to reproduce, expected versus actual result, environment details..."
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Severity</span>
            <select className="input" value={severity} onChange={(event) => setSeverity(event.target.value)}>
              {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Priority</span>
            <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)}>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating issue...' : 'Create issue'}
          </button>
        </div>
      </form>
    </div>
  );
}