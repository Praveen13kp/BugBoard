export default function SuccessBox({ message, children, onDismiss }) {
  if (!message && !children) return null;

  return (
    <div className="alert alert--success" role="status">
      <span>{message || children}</span>
      {onDismiss && (
        <button type="button" className="btn btn--ghost btn--small" onClick={onDismiss} aria-label="Dismiss">
          Dismiss
        </button>
      )}
    </div>
  );
}