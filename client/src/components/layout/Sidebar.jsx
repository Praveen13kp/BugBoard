import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLE_LABELS } from '../../utils/format';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/issues', label: 'Issues' },
  { to: '/projects', label: 'Projects' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">B</span>
        <span>
          <span className="brand-name">BugBoard</span>
          <span className="brand-tag">Issue tracker</span>
        </span>
      </NavLink>

      <nav className="nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-chip">
            <span className="user-chip-name">{user.name}</span>
            <span className="user-chip-role">{USER_ROLE_LABELS[user.role] || user.role}</span>
          </div>
        )}
        <button type="button" className="btn btn--ghost" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}