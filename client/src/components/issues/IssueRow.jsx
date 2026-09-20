import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { STATUS_LABELS } from '../../utils/format';
import Badge from '../common/Badge';

function slug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function personName(person) {
  return person?.name ?? 'Unassigned';
}

export default function IssueRow({ issue }) {
  const statusClass = slug(issue.status);
  return (
    <Link to={`/issues/${issue.id}`} className="issue-row">
      <div className="issue-row-key">
        <span className="issue-key mono">
          {issue.project?.key || '?'}-{issue.id.slice(0, 6)}
        </span>
        <span className={`issue-row-status badge badge--status badge--${statusClass}`}>
          <span className="badge-dot" aria-hidden="true" />
          {STATUS_LABELS[issue.status] || issue.status}
        </span>
      </div>
      <div className="issue-row-title">
        <span className="issue-title">{issue.title}</span>
        <span className="issue-meta">
          <span>{issue.project?.name || '—'}</span>
          <span aria-hidden="true">·</span>
          <span>Updated {formatUpdated(issue.updatedAt)}</span>
        </span>
      </div>
      <div className="issue-row-pills">
        <Badge kind="severity" value={issue.severity} />
        <Badge kind="priority" value={issue.priority} />
      </div>
      <div className="issue-row-assignee">
        {issue.assignee ? (
          <>
            <span className="avatar avatar--sm" aria-hidden="true">
              {personName(issue.assignee).charAt(0).toUpperCase()}
            </span>
            <span>{personName(issue.assignee)}</span>
          </>
        ) : (
          <span className="subtle">Unassigned</span>
        )}
        <ChevronRight className="issue-row-chevron" size={16} aria-hidden="true" />
      </div>
    </Link>
  );
}

function formatUpdated(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}