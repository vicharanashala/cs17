import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Both fields are required.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      if (user.requirePasswordReset) {
        navigate('/forum?change-password=1');
      } else {
        navigate('/forum');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col">
      {/* Minimal header */}
      <header className="h-header-height border-b border-ink-100 flex items-center px-container-margin">
        <Link to="/faq" className="font-headline-md text-headline-md font-black tracking-tight text-ink-900 hover:text-primary transition-colors">
          VINS · Yaksha
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-surface border border-ink-100 rounded-xl p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="font-headline-md text-headline-md text-ink-900 mb-1">Sign in</h1>
              <p className="font-body-sm text-body-sm text-ink-400">
                Access the community query forum
              </p>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-error-container rounded-lg border border-error/20">
                <p className="font-body-sm text-body-sm text-error">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="you@institution.ac.in"
                  className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-lg font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-lg font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 font-body-sm text-body-sm text-ink-400 text-center">
              Don't have an account?{' '}
              <span className="text-ink-700">Contact your administrator.</span>
            </p>
          </div>

          <p className="mt-4 text-center">
            <Link to="/faq" className="font-body-sm text-body-sm text-ink-400 hover:text-primary transition-colors">
              ← Back to FAQ
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
