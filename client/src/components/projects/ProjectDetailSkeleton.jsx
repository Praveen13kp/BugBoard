export default function ProjectDetailSkeleton() {
  return (
    <div className="page" aria-hidden="true" aria-label="Loading project">
      <div className="skeleton-card" style={{ padding: 'var(--sp-6) var(--sp-8)' }}>
        <span className="skeleton skeleton-line" style={{ width: '20%' }} />
        <span className="skeleton skeleton-line" style={{ width: '45%', height: 26 }} />
        <span className="skeleton skeleton-line" style={{ width: '60%' }} />
      </div>
      <div className="skeleton-card" style={{ minHeight: 140 }}>
        <span className="skeleton skeleton-line" style={{ width: '30%' }} />
        <span className="skeleton skeleton-line" style={{ width: '70%' }} />
        <span className="skeleton skeleton-line" style={{ width: '55%' }} />
      </div>
      <div className="skeleton-card" style={{ minHeight: 180 }}>
        <span className="skeleton skeleton-line" style={{ width: '35%' }} />
        <span className="skeleton skeleton-line" style={{ width: '85%' }} />
        <span className="skeleton skeleton-line" style={{ width: '80%' }} />
      </div>
    </div>
  );
}