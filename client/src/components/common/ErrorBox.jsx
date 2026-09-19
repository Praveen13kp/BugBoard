export default function ErrorBox({ title = 'Unable to load data', message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <p className="state-title">{title}</p>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}