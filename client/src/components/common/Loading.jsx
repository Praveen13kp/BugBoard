export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="state-box" role="status">
      <span className="state-icon" aria-hidden="true">
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2.5px solid var(--brand-200)',
            borderTopColor: 'var(--brand-600)',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </span>
      <p className="state-message">{text}</p>
    </div>
  );
}