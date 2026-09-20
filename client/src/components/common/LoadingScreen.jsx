export default function LoadingScreen({ text = 'Loading BugBoard...' }) {
  return (
    <div className="loading-screen" role="status">
      <span className="loading-screen-logo" aria-hidden="true">
        B
      </span>
      <p>{text}</p>
    </div>
  );
}