import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Bug,
  CalendarClock,
  Edit3,
  FileText,
  Flag,
  FolderKanban,
  MessageCirclePlus,
  Send,
  TrendingUp,
  User,
  UserCheck,
  X,
} from 'lucide-react';
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
import { useToast } from '../components/common/Toast';

function personName(person) {
  return person?.name ?? 'Unassigned';
}

function activityMeta(entry) {
  const map = {
    created: { icon: Flag, text: 'Opened this issue.' },
    status: { icon: ArrowLeftRight, text: `moved status to ${entry.newValue || '—'}.` },
    assignee: { icon: UserCheck, text: `assigned this issue to ${entry.newValue || 'no one'}.` },
    severity: { icon: AlertTriangle, text: `changed severity to ${entry.newValue || '—'}.` },
    priority: { icon: TrendingUp, text: `changed priority to ${entry.newValue || '—'}.` },
    title: { icon: FileText, text: `renamed the title to "${entry.newValue}".` },
    description: { icon: FileText, text: 'updated the description.' },
  };
  return map[entry.field || entry.action] || { icon: Activity, text: `made a change to ${entry.field || 'this issue'}.` };
}

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

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
  }

  async function refreshActivity() {
    setActivity((await apiListActivity(issueId)).activity);
  }

  async function handleStatusChange(nextStatus) {
    setActionBusy(true);
    try {
      const result = await apiChangeStatus(issueId, nextStatus);
      updateIssue(result.issue);
      await refreshActivity();
      toast.success('Status updated', `The issue is now ${STATUS_LABELS[nextStatus] || nextStatus}.`);
    } catch (statusError) {
      toast.error('Unable to change the status', errorMessage(statusError, 'Please try again.'));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleAssigneeChange(nextAssignee) {
    setActionBusy(true);
    try {
      const result = await apiChangeAssignee(issueId, nextAssignee || null);
      updateIssue(result.issue);
      await refreshActivity();
      toast.success('Assignee updated', nextAssignee ? 'The issue has been reassigned.' : 'The issue is unassigned.');
    } catch (assignError) {
      toast.error('Unable to reassign the issue', errorMessage(assignError, 'Please try again.'));
    } finally {
      setActionBusy(false);
    }
  }

  if (error) return <div className="page"><ErrorBox message={error} onRetry={load} /></div>;
  if (loading || !issue) return <IssueDetailSkeleton />;

  const canEdit = canUpdateIssue(user, issue);
  const canMove = canTransitionIssue(user, issue);
  const canAssign = canAssignIssue(user.role);

  return (
    <div className="page">
      {/* Header */}
      <section className="issue-header" aria-labelledby="issue-title">
        <p className="eyebrow">
          <Bug size={15} aria-hidden="true" />
          {issue.project?.key}-{issue.id.slice(0, 6)}
        </p>
        <h2 id="issue-title">{issue.title}</h2>
        <div className="badge-row">
          <Badge kind="status" value={issue.status} />
          <Badge kind="severity" value={issue.severity} />
          <Badge kind="priority" value={issue.priority} />
        </div>
        <div className="issue-header-meta">
          <span>
            <User size={14} aria-hidden="true" /> {personName(issue.reporter)}
          </span>
          <span>
            <CalendarClock size={14} aria-hidden="true" /> Updated {formatDate(issue.updatedAt)}
          </span>
        </div>
      </section>

      {/* Detail grid */}
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
          <div className="detail-item">
            <dt>Created</dt>
            <dd>{formatDate(issue.createdAt)}</dd>
          </div>
        </dl>

        <div className="detail-actions">
          <p className="detail-actions-title">Take action</p>
          {canMove && (
            <label className="field">
              <span className="field-label">Move status</span>
              <select
                className="input"
                value={issue.status}
                disabled={actionBusy}
                onChange={(event) => handleStatusChange(event.target.value)}
              >
                {[...issue.allowedStatusTransitions].map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
              {issue.allowedStatusTransitions.length === 0 && (
                <p className="field-hint">No further transitions are allowed.</p>
              )}
            </label>
          )}
          {canAssign && (
            <label className="field">
              <span className="field-label">Assign to</span>
              <select
                className="input"
                value={issue.assignee?.id || ''}
                disabled={actionBusy}
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
              toast.success('Issue details updated', 'Title, description, and fields saved.');
            }}
          />
        </div>
      </section>

      {/* Description */}
      <section className="section">
        <div className="section-heading">
          <h3>Description</h3>
        </div>
        <div className="panel description-panel">
          <p className="issue-description">{issue.description}</p>
        </div>
      </section>

      <IssueComments
        issueId={issueId}
        comments={comments}
        onAdd={(comment) => setComments((list) => [comment, ...list])}
        onError={() => {}}
      />

      {/* Activity */}
      <section className="section">
        <div className="section-heading">
          <h3>
            <Activity size={18} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />
            Activity ({activity.length})
          </h3>
        </div>
        {activity.length === 0 ? (
          <EmptyState title="No activity recorded yet" message="Important changes will appear here as a timeline." />
        ) : (
          <div className="panel" style={{ padding: 'var(--sp-4) var(--sp-6)' }}>
            <ul className="activity-timeline">
              {activity.map((entry) => {
                const meta = activityMeta(entry);
                const Icon = meta.icon;
                return (
                  <li key={entry.id} className="activity-item">
                    <span className="activity-icon" aria-hidden="true">
                      <Icon size={15} />
                    </span>
                    <div className="activity-body">
                      <p className="activity-text">
                        <strong>{entry.actor?.name || 'Someone'}</strong> {meta.text}
                      </p>
                      <p className="activity-time">{formatDate(entry.timestamp)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
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
      <button type="button" className="btn btn--secondary" onClick={() => setEditing(true)}>
        <Edit3 size={15} aria-hidden="true" /> Edit details
      </button>
    );
  }

  return (
    <form className="issue-edit-form" onSubmit={handleSubmit}>
      <div className="form-row" style={{ justifyContent: 'space-between' }}>
        <strong>Edit issue</strong>
        <button type="button" className="btn btn--icon btn--ghost" aria-label="Cancel editing" onClick={() => setEditing(false)}>
          <X size={16} />
        </button>
      </div>
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
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" /> Saving...
            </>
          ) : (
            'Save changes'
          )}
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
        <h3>
          <MessageCirclePlus size={18} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />
          Comments ({comments.length})
        </h3>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="panel comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-row">
          <label className="sr-only" htmlFor="comment-field">
            Add a comment
          </label>
          <textarea
            id="comment-field"
            className="input"
            required
            minLength={1}
            rows={2}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment..."
          />
          <button type="submit" className="btn btn--primary" disabled={submitting || !content.trim()} aria-label="Post comment">
            {submitting ? (
              <span className="btn-spinner" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <EmptyState title="No comments yet" message="Be the first to add context to this issue." />
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <span className="avatar" aria-hidden="true">
                {(comment.author?.name || '?').charAt(0).toUpperCase()}
              </span>
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

function IssueDetailSkeleton() {
  return (
    <div className="page" aria-hidden="true" aria-label="Loading issue">
      <div className="skeleton-card" style={{ padding: 'var(--sp-8)' }}>
        <span className="skeleton skeleton-line" style={{ width: '30%' }} />
        <span className="skeleton skeleton-line" style={{ width: '62%', height: 28 }} />
        <span className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton-card" style={{ minHeight: 220 }}>
        <span className="skeleton skeleton-block" />
        <span className="skeleton skeleton-block" />
      </div>
      <div className="skeleton-card" style={{ minHeight: 160 }}>
        <span className="skeleton skeleton-line" style={{ width: '40%' }} />
        <span className="skeleton skeleton-line" style={{ width: '80%' }} />
      </div>
    </div>
  );
}