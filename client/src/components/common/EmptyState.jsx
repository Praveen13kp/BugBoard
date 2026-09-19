export default function EmptyState({ title = 'Nothing here yet', message, children }) {
  return (
    <div className="state-box state-box--empty">
      <p className="state-title">{title}</p>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}