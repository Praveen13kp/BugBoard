import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <section className="auth-card">
        <p className="eyebrow">BugBoard</p>
        <h1>Sign in</h1>
        <p className="auth-subtitle">Track bugs across your projects.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}