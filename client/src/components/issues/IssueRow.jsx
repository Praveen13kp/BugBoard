import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/format';

function personName(person) {
  return person?.name ?? 'Unassigned';
}

export default function IssueRow({ issue }) {
  return (
    <Link to={`/issues/${issue.id}`} className="issue-row">
      <div className="issue-row-key">
        <span className="issue-key">
          {issue.project?.key || '?'}-{issue.id.slice(0, 6)}
        </span>
      </div>
      <div className="issue-row-title">
        <span className="issue-title">{issue.title}</span>
        <span className="issue-meta">
          {issue.project?.name} · updated {formatDate(issue.updatedAt)}
        </span>
      </div>
      <div className="issue-row-pills">
        <Badge kind="status" value={issue.status} />
        <Badge kind="severity" value={issue.severity} />
        <Badge kind="priority" value={issue.priority} />
      </div>
      <div className="issue-row-assignee">
        <span className="avatar" aria-hidden="true">
          {personName(issue.assignee).charAt(0).toUpperCase()}
        </span>
        <span>{personName(issue.assignee)}</span>
      </div>
    </Link>
  );
}