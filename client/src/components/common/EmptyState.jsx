import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title, message, icon: Icon, children }) {
  const IconComponent = Icon || ClipboardList;
  return (
    <div className="state-box state-box--empty" role="status">
      <span className="state-icon" aria-hidden="true">
        <IconComponent size={26} />
      </span>
      <p className="state-title">{title}</p>
      {message && <p className="state-message">{message}</p>}
      {children && <div className="state-action">{children}</div>}
    </div>
  );
}