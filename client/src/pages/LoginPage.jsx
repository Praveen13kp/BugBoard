import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react';
import { errorMessage } from '../api/error';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (loginError) {
      setError(errorMessage(loginError, 'Unable to sign in.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <AuthVisual />
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-title">
            <p className="eyebrow">Welcome back</p>
            <h1>Sign in to BugBoard</h1>
            <p>Track bugs, assign work, and keep your team moving.</p>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span className="field-label">Email</span>
              <div className="input-field">
                <Mail className="input-icon" size={16} aria-hidden="true" />
                <input
                  className="input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <div className="input-field">
                <input
                  className="input input--icon-right"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  className="input-icon input-icon--right"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" /> Signing in...
                </>
              ) : (
                <>
                  <LogIn size={17} aria-hidden="true" /> Sign in
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-hidden="true">
      <div className="auth-visual-top">
        <span className="brand-mark">B</span>
        <span className="auth-visual-brand">BugBoard</span>
      </div>
      <div className="auth-visual-copy">
        <h2>Every bug resolved starts with a clear report.</h2>
        <p>
          One lightweight board for reporting, assigning, testing, and closing issues — with the
          access controls your team actually needs.
        </p>
      </div>
      <div className="auth-visual-steps">
        <div className="auth-visual-step">
          <b>1 · Report</b>
          <span>Capture the bug with severity, priority, and steps to reproduce.</span>
        </div>
        <div className="auth-visual-step">
          <b>2 · Assign</b>
          <span>Give every issue a clear owner and a validated workflow.</span>
        </div>
        <div className="auth-visual-step">
          <b>3 · Resolve</b>
          <span>Track progress to Testing, Resolved, and Closed.</span>
        </div>
      </div>
    </aside>
  );
}