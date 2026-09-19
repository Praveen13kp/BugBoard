export default function LoadingScreen({ text = 'Loading BugBoard...' }) {
  return (
    <div className="loading-screen">
      <span className="spinner spinner--large" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}