import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiAddMembers, apiGetProject, apiRemoveMember } from '../api/projects';
import { apiListIssues } from '../api/issues';
import { apiListUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { USER_ROLE_LABELS } from '../utils/format';
import { canManageProjects, canReportIssueForProject } from '../utils/permissions';
import ErrorBox from '../components/common/ErrorBox';
import EmptyState from '../components/common/EmptyState';
import IssueRow from '../components/issues/IssueRow';
import Loading from '../components/common/Loading';
import SuccessBox from '../components/common/SuccessBox';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const isAdmin = canManageProjects(user.role);
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { project: nextProject } = await apiGetProject(projectId);
      const { issues: projectIssues } = await apiListIssues({ project: projectId });
      setProject(nextProject);
      setIssues(projectIssues);
      if (isAdmin) {
        apiListUsers()
          .then(({ users: list }) => setUsers(list))
          .catch(() => {});
      }
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load the project.'));
    } finally {
      setLoading(false);
    }
  }, [projectId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddMember(event) {
    event.preventDefault();
    if (!selectedUser) return;
    setActionError('');
    setSuccessMessage('');
    try {
      const { project: nextProject } = await apiAddMembers(projectId, [selectedUser]);
      setProject(nextProject);
      setSelectedUser('');
      setSuccessMessage('Member added.');
    } catch (addError) {
      setActionError(errorMessage(addError, 'Unable to add the member.'));
    }
  }

  async function handleRemoveMember(userId) {
    setActionError('');
    setSuccessMessage('');
    try {
      const { project: nextProject } = await apiRemoveMember(projectId, userId);
      setProject(nextProject);
      setSuccessMessage('Member removed.');
    } catch (removeError) {
      setActionError(errorMessage(removeError, 'Unable to remove the member.'));
    }
  }

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (loading || !project) return <Loading text="Loading project..." />;

  const memberIds = new Set(project.members.map((member) => member.id));
  const availableUsers = users.filter((candidate) => !memberIds.has(candidate.id));
  const canReport = canReportIssueForProject(user, project);

  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">{project.key}</p>
        <h2>{project.name}</h2>
        <p className="muted">{project.description || 'No description provided.'}</p>
      </section>

      {actionError && <div className="alert alert--error">{actionError}</div>}
      <SuccessBox message={successMessage} onDismiss={() => setSuccessMessage('')} />

      {isAdmin && (
        <section className="panel">
          <h3>Add member</h3>
          <form className="form-row" onSubmit={handleAddMember}>
            <select
              className="input"
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
              aria-label="Choose a user to add"
            >
              <option value="">Choose a user...</option>
              {availableUsers.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} ({USER_ROLE_LABELS[candidate.role] || candidate.role}) — {candidate.email}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn--primary" disabled={!selectedUser}>
              Add
            </button>
          </form>
        </section>
      )}

      <section className="section">
        <div className="section-heading">
          <h3>Members ({project.memberCount})</h3>
        </div>
        {project.members.length === 0 ? (
          <p className="muted">No members yet.</p>
        ) : (
          <ul className="member-list">
            {project.members.map((member) => (
              <li key={member.id} className="member-chip">
                <span className="avatar" aria-hidden="true">
                  {member.name.charAt(0).toUpperCase()}
                </span>
                <span className="member-info">
                  <span>{member.name}</span>
                  <span className="muted">{USER_ROLE_LABELS[member.role] || member.role}</span>
                </span>
                {isAdmin && member.id !== user.id && (
                  <button type="button" className="btn btn--danger btn--small" onClick={() => handleRemoveMember(member.id)}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <h3>Issues ({issues.length})</h3>
          {canReport && (
            <Link className="link" to={`/create-issue?project=${projectId}`}>
              Report an issue
            </Link>
          )}
        </div>
        {issues.length === 0 ? (
          <EmptyState title="No issues in this project" message="Report the first bug for this project." />
        ) : (
          <div className="issue-list">
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}