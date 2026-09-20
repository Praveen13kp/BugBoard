export default function ProjectsSkeleton({ count = 6 }) {
  return (
    <div className="card-grid" aria-hidden="true" aria-label="Loading projects">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card project-card-skeleton" key={index}>
          <span className="skeleton skeleton-badge" />
          <span className="skeleton skeleton-line" style={{ width: '60%', height: 20 }} />
          <span className="skeleton skeleton-line" style={{ width: '88%' }} />
          <span className="skeleton skeleton-line" style={{ width: '70%' }} />
          <span className="skeleton skeleton-line" style={{ width: '45%' }} />
        </div>
      ))}
    </div>
  );
}