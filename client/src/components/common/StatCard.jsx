import { Link } from 'react-router-dom';

export default function StatCard({ label, value, to, tone, icon: Icon }) {
  const content = (
    <>
      <span className="stat-card-icon" aria-hidden="true">
        {Icon && <Icon size={20} />}
      </span>
      <span className="stat-card-value">{value}</span>
      <span className="stat-card-label">{label}</span>
    </>
  );

  const className = `stat-card${tone ? ` stat-card--${tone}` : ''}`;

  return (
    <div className={className}>
      {to ? (
        <Link to={to} className="stat-card-link" aria-label={`View ${label} issues`}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}