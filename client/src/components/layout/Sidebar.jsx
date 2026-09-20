import { NavLink, useNavigate } from 'react-router-dom';
import { Layers, LayoutDashboard, LogOut, Shapes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLE_LABELS } from '../../utils/format';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/issues', label: 'Issues', icon: Shapes },
  { to: '/projects', label: 'Projects', icon: Layers },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      {open && (
        <button
          type="button"
          className="app-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Main navigation">
        <NavLink to="/" className="brand" onClick={onClose}>
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>
            <span className="brand-name">BugBoard</span>
            <span className="brand-tag">Issue tracker</span>
          </span>
        </NavLink>

        <nav className="nav">
          <p className="nav-label">Workspace</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                <Icon size={19} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-chip">
              <span className="avatar avatar--sm" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="user-chip-info">
                <span className="user-chip-name">{user.name}</span>
                <span className="user-chip-role">{USER_ROLE_LABELS[user.role] || user.role}</span>
              </span>
              <button type="button" className="btn btn--icon btn--ghost" aria-label="Sign out" onClick={handleLogout}>
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}