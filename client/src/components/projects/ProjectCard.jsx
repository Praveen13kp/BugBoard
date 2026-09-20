import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { formatDate } from '../../utils/format';

export default function ProjectCard({ project, tone }) {
  const memberCount = project.memberCount ?? project.members?.length ?? 0;

  return (
    <Link to={`/projects/${project.id}`} className="card project-card">
      <div className="project-card-top">
        <span className="project-key" style={{ background: tone.bg, color: tone.fg }}>
          {project.key}
        </span>
        <ArrowUpRight className="project-link-icon" size={18} aria-hidden="true" />
      </div>
      <h3 className="project-card-title">{project.name}</h3>
      <p className="project-card-desc">{project.description || 'No description provided.'}</p>
      <div className="project-card-metrics">
        <span className="metric">
          <b>{memberCount}</b> {memberCount === 1 ? 'member' : 'members'}
        </span>
      </div>
      <div className="project-card-footer">
        <span className="muted project-card-date">
          <CalendarClock size={13} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 4 }} />
          Created {formatDate(project.createdAt)}
        </span>
      </div>
    </Link>
  );
}