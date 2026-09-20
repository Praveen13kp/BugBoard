import { useState } from 'react';
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
  const [drag, setDrag] = useState(null);

  function startDrag(issue) {
    if (movingId) return;
    setDrag({ issue, target: null });
  }

  function clearDrag() {
    setDrag(null);
  }

  function handleDragOver(event, status) {
    event.preventDefault();
    if (!drag) return;
    const valid = (drag.issue.allowedStatusTransitions || []).includes(status);
    setDrag((current) => (current ? { ...current, target: status, verdict: valid ? 'valid' : 'invalid' } : current));
  }

  function handleDrop(event, status) {
    event.preventDefault();
    if (!drag) return;
    const issue = drag.issue;
    setDrag(null);
    onMove(issue, status);
  }

  return (
    <div className="kanban">
      {ISSUE_STATUS_ORDER.map((status) => {
        const columnIssues = groups.get(status) || [];
        const isTarget = drag?.target === status;
        const isInvalidTarget = isTarget && drag?.verdict === 'invalid';
        const columnClass = [
          'kanban-column',
          isTarget ? (isInvalidTarget ? 'is-drop-invalid' : 'is-drop-target') : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <section
            key={status}
            className={columnClass}
            aria-label={`${STATUS_LABELS[status]} issues`}
            onDragOver={(event) => handleDragOver(event, status)}
            onDrop={(event) => handleDrop(event, status)}
          >
            <header className="kanban-column-head">
              <span className={`kanban-dot kanban-dot--${slug(status)}`} aria-hidden="true" />
              <strong>{STATUS_LABELS[status]}</strong>
              <span className="kanban-count">{columnIssues.length}</span>
            </header>
            <div className="kanban-column-body">
              {columnIssues.length === 0 && <p className="kanban-empty">No issues</p>}
              {columnIssues.map((issue) => (
                <KanbanCard
                  key={issue.id}
                  issue={issue}
                  onMove={onMove}
                  moving={movingId === issue.id}
                  dragging={drag?.issue?.id === issue.id}
                  onDragStart={() => startDrag(issue)}
                  onDragEnd={clearDrag}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function KanbanCard({ issue, onMove, moving, dragging, onDragStart, onDragEnd }) {
  const statusClass = slug(issue.status);
  const className = [
    'kanban-card',
    `kanban-card--${statusClass}`,
    moving ? 'is-moving' : '',
    dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      draggable={!moving}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', issue.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      title="Drag to move between columns"
    >
      <span className="issue-key mono">
        {issue.project?.key || '?'}-{issue.id.slice(0, 6)}
      </span>
      <Link to={`/issues/${issue.id}`} className="kanban-card-title">
        {issue.title}
      </Link>
      <div className="kanban-card-row">
        <Badge kind="priority" value={issue.priority} />
        <Badge kind="severity" value={issue.severity} />
      </div>
      <footer className="kanban-card-foot">
        <span className="kanban-assignee">
          {issue.assignee ? (
            <>
              <span className="avatar avatar--xs" aria-hidden="true">
                {personName(issue.assignee).charAt(0).toUpperCase()}
              </span>
              {personName(issue.assignee)}
            </>
          ) : (
            <span className="subtle">Unassigned</span>
          )}
        </span>
        <MoveControl issue={issue} onMove={onMove} disabled={moving || dragging} />
      </footer>
    </article>
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