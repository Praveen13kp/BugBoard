import { Link } from 'react-router-dom';

export default function StatCard({ label, value, to, tone }) {
  const content = (
    <>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </>
  );

  return (
    <div className={`stat-card${tone ? ` stat-card--${tone}` : ''}`}>
      {to ? (
        <Link to={to} className="stat-card-link">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}