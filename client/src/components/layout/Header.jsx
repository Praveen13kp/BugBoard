import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { canReportIssueForProject } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';

const TITLES = {
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

export default function Header({ onMenu, canReport }) {
  const location = useLocation();
  return (
    <header className="topbar">
      <button type="button" className="menu-toggle" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={19} />
      </button>
      <div>
        <p className="topbar-crumb">BugBoard</p>
        <h1 className="topbar-title">{titleFor(location.pathname)}</h1>
      </div>
      <span className="topbar-spacer" />
      <div className="topbar-actions">
        {canReport && (
          <Link to="/create-issue" className="btn btn--primary btn--small">
            <Plus size={16} aria-hidden="true" />
            <span>New issue</span>
          </Link>
        )}
      </div>
    </header>
  );
}