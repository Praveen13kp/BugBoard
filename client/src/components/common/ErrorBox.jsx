import { AlertTriangle } from 'lucide-react';

export default function ErrorBox({ title = 'Unable to load data', message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <span className="state-icon" aria-hidden="true">
        <AlertTriangle size={26} />
      </span>
      <p className="state-title">{title}</p>
      {message && <p className="state-message">{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}