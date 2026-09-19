import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/issues': 'Issues',
  '/projects': 'Projects',
  '/create-issue': 'Create Issue',
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/projects/')) return 'Project';
  if (pathname.startsWith('/issues/')) return 'Issue';
  return 'BugBoard';
}

export default function Header() {
  const location = useLocation();
  return (
    <header className="header">
      <h1 className="header-title">{titleFor(location.pathname)}</h1>
    </header>
  );
}