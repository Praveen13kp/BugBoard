import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertOctagon, FilePlus, FolderKanban, Gauge, ListChecks, Send, User as UserIcon } from 'lucide-react';
import { errorMessage } from '../api/error';
import { apiCreateIssue } from '../api/issues';
import { apiGetProject, apiListProjects } from '../api/projects';
import { PRIORITY_LABELS, SEVERITY_LABELS } from '../utils/format';
import { canReportIssueForProject } from '../utils/permissions';
import EmptyState from '../components/common/EmptyState';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiListProjects()
      .then(({ projects: list }) => {
        if (active) setProjects(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
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

  const reportableProjects =
    user.role === 'ADMIN' ? projects : projects.filter((project) => canReportIssueForProject(user, project));

  if (loading) {
    return (
      <div className="page">
        <section className="page-heading">
          <h2>Report an issue</h2>
          <p className="muted">You will be recorded as the reporter.</p>
        </section>
        <div className="skeleton-card" style={{ minHeight: 420 }} aria-hidden="true">
          <span className="skeleton skeleton-line" style={{ width: '30%' }} />
          <span className="skeleton skeleton-block" />
          <span className="skeleton skeleton-block" />
          <span className="skeleton skeleton-line" style={{ width: '50%' }} />
        </div>
      </div>
    );
  }

  if (reportableProjects.length === 0) {
    return (
      <div className="page">
        <section className="page-heading">
          <h2>Report an issue</h2>
        </section>
        <EmptyState
          title="No projects available"
          message="You can only report issues in projects you belong to. Ask an administrator to add you as a member."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-heading page-heading--row">
        <div>
          <h2>Report an issue</h2>
          <p className="muted">You will be recorded as the reporter.</p>
        </div>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}

        <fieldset className="form-section">
          <legend className="form-section-title">
            <span className="form-section-number">1</span> Target
          </legend>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">
                <FolderKanban size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
                Project
              </span>
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
                {reportableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">
                <UserIcon size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
                Assignee
              </span>
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
        </fieldset>

        <fieldset className="form-section">
          <legend className="form-section-title">
            <span className="form-section-number">2</span> Issue details
          </legend>
          <label className="field">
            <span className="field-label">
              <FilePlus size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
              Title
            </span>
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
        </fieldset>

        <fieldset className="form-section">
          <legend className="form-section-title">
            <span className="form-section-number">3</span> Classification
          </legend>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">
                <AlertOctagon size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
                Severity
              </span>
              <select className="input" value={severity} onChange={(event) => setSeverity(event.target.value)}>
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">
                <Gauge size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />
                Priority
              </span>
              <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)}>
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <div className="form-actions form-actions--sticky">
          <span className="muted form-actions-note">
            <ListChecks size={15} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />
            You can adjust the workflow status after creating the issue.
          </span>
          <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" /> Creating issue...
              </>
            ) : (
              <>
                <Send size={17} aria-hidden="true" /> Create issue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}