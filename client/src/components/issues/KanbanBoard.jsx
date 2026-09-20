import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { STATUS_LABELS } from '../../utils/format';
import { ISSUE_STATUS_ORDER, groupIssuesByStatus } from '../../utils/issueGroups';

function personName(person) {
  return person?.name ?? 'Unassigned';
}

function slug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

export default function KanbanBoard({ issues, onMove, movingId }) {
  const groups = groupIssuesByStatus(issues);

  return (
    <div className="kanban">
      {ISSUE_STATUS_ORDER.map((status) => {
        const columnIssues = groups.get(status) || [];
        return (
          <section key={status} className="kanban-column" aria-label={`${STATUS_LABELS[status]} issues`}>
            <header className="kanban-column-head">
              <span className={`kanban-dot kanban-dot--${slug(status)}`} aria-hidden="true" />
              <strong>{STATUS_LABELS[status]}</strong>
              <span className="kanban-count">{columnIssues.length}</span>
            </header>
            <div className="kanban-column-body">
              {columnIssues.length === 0 && <p className="kanban-empty">No issues</p>}
              {columnIssues.map((issue) => (
                <article key={issue.id} className="kanban-card">
                  <Link className="kanban-card-link" to={`/issues/${issue.id}`}>
                    <span className="issue-key">
                      {issue.project?.key || '?'}-{issue.id.slice(0, 6)}
                    </span>
                    <h4>{issue.title}</h4>
                  </Link>
                  <div className="kanban-card-row">
                    <Badge kind="priority" value={issue.priority} />
                    <Badge kind="severity" value={issue.severity} />
                  </div>
                  <footer className="kanban-card-foot">
                    <span className="kanban-assignee">{personName(issue.assignee)}</span>
                    <MoveControl issue={issue} onMove={onMove} disabled={movingId === issue.id} />
                  </footer>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MoveControl({ issue, onMove, disabled }) {
  const transitions = issue.allowedStatusTransitions || [];
  if (transitions.length === 0) {
    return <span className="kanban-final">Final</span>;
  }

  return (
    <select
      className="kanban-move input"
      aria-label={`Move "${issue.title}" to another status`}
      value=""
      disabled={disabled}
      onChange={(event) => onMove(issue, event.target.value)}
    >
      <option value="" disabled>
        Move →
      </option>
      {transitions.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status] || status}
        </option>
      ))}
    </select>
  );
}