import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiListActivity } from '../api/activity';
import { apiListComments, apiAddComment } from '../api/comments';
import { apiChangeAssignee, apiChangeStatus, apiGetIssue, apiUpdateIssue } from '../api/issues';
import { apiGetProject } from '../api/projects';
import { useAuth } from '../context/AuthContext';
import { formatDate, PRIORITY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '../utils/format';
import { canAssignIssue, canTransitionIssue, canUpdateIssue } from '../utils/permissions';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ErrorBox from '../components/common/ErrorBox';
import Loading from '../components/common/Loading';
import SuccessBox from '../components/common/SuccessBox';

function personName(person) {
  return person?.name ?? 'Unassigned';
}

function activityText(entry) {
  const actor = entry.actor?.name || 'Someone';
  const { field, oldValue, newValue } = entry;

  if (entry.action === 'created') return `${actor} opened this issue.`;
  if (field === 'status') return `${actor} moved status ${oldValue} → ${newValue}.`;
  if (field === 'assignee') return `${actor} assigned this issue to ${newValue || 'no one'}.`;
  if (field === 'severity') return `${actor} changed severity ${oldValue} → ${newValue}.`;
  if (field === 'priority') return `${actor} changed priority ${oldValue} → ${newValue}.`;
  if (field === 'title') return `${actor} renamed the title to "${newValue}".`;
  if (field === 'description') return `${actor} updated the description.`;
  return `${actor} ${entry.action}${field ? ` ${field}` : ''}.`;
}

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { issue: nextIssue } = await apiGetIssue(issueId);
      const [projectResult, commentsResult, activityResult] = await Promise.all([
        apiGetProject(nextIssue.project.id),
        apiListComments(issueId),
        apiListActivity(issueId),
      ]);
      setIssue(nextIssue);
      setProject(projectResult.project);
      setComments(commentsResult.comments);
      setActivity(activityResult.activity);
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load the issue.'));
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    load();
  }, [load]);

  function updateIssue(nextIssue) {
    setIssue(nextIssue);
    setActionError('');
  }

  async function handleStatusChange(nextStatus) {
    setActionError('');
    setSuccessMessage('');
    try {
      const result = await apiChangeStatus(issueId, nextStatus);
      updateIssue(result.issue);
      setActivity((await apiListActivity(issueId)).activity);
      setSuccessMessage('Status updated.');
    } catch (statusError) {
      setActionError(errorMessage(statusError, 'Unable to change the status.'));
    }
  }

  async function handleAssigneeChange(nextAssignee) {
    setActionError('');
    setSuccessMessage('');
    try {
      const result = await apiChangeAssignee(issueId, nextAssignee || null);
      updateIssue(result.issue);
      setActivity((await apiListActivity(issueId)).activity);
      setSuccessMessage('Assignee updated.');
    } catch (assignError) {
      setActionError(errorMessage(assignError, 'Unable to reassign the issue.'));
    }
  }

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (loading || !issue) return <Loading text="Loading issue..." />;

  const canEdit = canUpdateIssue(user, issue);
  const canMove = canTransitionIssue(user, issue);
  const canAssign = canAssignIssue(user.role);

  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">
          {issue.project?.key}-{issue.id.slice(0, 6)}
        </p>
        <h2>{issue.title}</h2>
        <div className="badge-row">
          <Badge kind="status" value={issue.status} />
          <Badge kind="severity" value={issue.severity} />
          <Badge kind="priority" value={issue.priority} />
        </div>
        <p className="muted">
          Reported by {personName(issue.reporter)} · created {formatDate(issue.createdAt)} · updated{' '}
          {formatDate(issue.updatedAt)}
        </p>
      </section>

      {actionError && <div className="alert alert--error">{actionError}</div>}
      <SuccessBox message={successMessage} onDismiss={() => setSuccessMessage('')} />

      <section className="panel detail-grid">
        <dl className="detail-list">
          <div className="detail-item">
            <dt>Project</dt>
            <dd>{issue.project?.name || '—'}</dd>
          </div>
          <div className="detail-item">
            <dt>Reporter</dt>
            <dd>{personName(issue.reporter)}</dd>
          </div>
          <div className="detail-item">
            <dt>Assignee</dt>
            <dd>{personName(issue.assignee)}</dd>
          </div>
          <div className="detail-item">
            <dt>Severity</dt>
            <dd>
              <Badge kind="severity" value={issue.severity} />
            </dd>
          </div>
          <div className="detail-item">
            <dt>Priority</dt>
            <dd>
              <Badge kind="priority" value={issue.priority} />
            </dd>
          </div>
        </dl>

        <div className="detail-actions">
          {canMove && (
            <label className="field">
              <span className="field-label">Move status</span>
              <select
                className="input"
                value={issue.status}
                onChange={(event) => handleStatusChange(event.target.value)}
              >
                {[...issue.allowedStatusTransitions].map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
              {issue.allowedStatusTransitions.length === 0 && (
                <p className="muted">No further transitions are allowed.</p>
              )}
            </label>
          )}
          {canAssign && (
            <label className="field">
              <span className="field-label">Assign to</span>
              <select
                className="input"
                value={issue.assignee?.id || ''}
                onChange={(event) => handleAssigneeChange(event.target.value)}
              >
                <option value="">Unassigned</option>
                {(project?.members || []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <IssueEditForm
            issue={issue}
            canEdit={canEdit}
            onSaved={({ issue: nextIssue }) => {
              updateIssue(nextIssue);
              setSuccessMessage('Issue details updated.');
            }}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h3>Description</h3>
        </div>
        <p className="issue-description">{issue.description}</p>
      </section>

      <IssueComments
        issueId={issueId}
        comments={comments}
        onAdd={(comment) => setComments((list) => [comment, ...list])}
      />

      <section className="section">
        <div className="section-heading">
          <h3>Activity ({activity.length})</h3>
        </div>
        {activity.length === 0 ? (
          <p className="muted">No activity recorded yet.</p>
        ) : (
          <ul className="activity-timeline">
            {activity.map((entry) => (
              <li key={entry.id} className="activity-item">
                <div className="activity-avatar" aria-hidden="true">
                  {(entry.actor?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="activity-body">
                  <p className="activity-text">{activityText(entry)}</p>
                  <p className="muted">{formatDate(entry.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function IssueEditForm({ issue, canEdit, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [severity, setSeverity] = useState(issue.severity);
  const [priority, setPriority] = useState(issue.priority);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(issue.title);
    setDescription(issue.description);
    setSeverity(issue.severity);
    setPriority(issue.priority);
  }, [issue]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiUpdateIssue(issue.id, { title, description, severity, priority });
      setSubmitting(false);
      setEditing(false);
      onSaved(result);
    } catch (submitError) {
      setError(errorMessage(submitError, 'Unable to update the issue.'));
      setSubmitting(false);
    }
  }

  if (!canEdit) return null;
  if (!editing) {
    return (
      <button type="button" className="btn" onClick={() => setEditing(true)}>
        Edit details
      </button>
    );
  }

  return (
    <form className="issue-edit-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert--error">{error}</div>}
      <label className="field">
        <span className="field-label">Title</span>
        <input className="input" required minLength={3} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="field">
        <span className="field-label">Description</span>
        <textarea
          className="input"
          required
          minLength={3}
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
      <div className="form-row">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" className="btn" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function IssueComments({ issueId, comments, onAdd }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { comment } = await apiAddComment(issueId, content);
      setContent('');
      setSubmitting(false);
      onAdd(comment);
    } catch (submitError) {
      setError(errorMessage(submitError, 'Unable to post the comment.'));
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h3>Comments ({comments.length})</h3>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="panel comment-form" onSubmit={handleSubmit}>
        <textarea
          className="input"
          required
          minLength={1}
          rows={2}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit" className="btn btn--primary" disabled={submitting || !content.trim()}>
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </form>

      {comments.length === 0 ? (
        <EmptyState title="No comments yet" message="Be the first to comment on this issue." />
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="avatar" aria-hidden="true">
                {(comment.author?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.author?.name || 'Unknown'}</strong>
                  <span className="muted">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}