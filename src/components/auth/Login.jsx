import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import teamMemberService from '../../services/teamMemberService';

function getLoginError(error) {
  if (!error.response) return 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.';
  if (error.response.status === 401) return 'نام کاربری یا رمز عبور نادرست است.';
  if (error.response.status === 403) return 'حساب شما اجازه ورود به این بخش را ندارد.';
  return error.response.data?.message || 'ورود انجام نشد. دوباره تلاش کنید.';
}

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/team" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier || !password) {
      setError('نام کاربری و رمز عبور را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const loginResponse = await teamMemberService.login(normalizedIdentifier, password);
      login(loginResponse);
      navigate(location.state?.from?.pathname || '/team', { replace: true });
    } catch (requestError) {
      setError(getLoginError(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl text-white shadow-lg shadow-emerald-500/20">
            <i className="fas fa-layer-group" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold">ورود به پنل مدیریت تیم</h1>
          <p className="mt-2 text-sm text-slate-400">برای ادامه، اطلاعات حساب کاربری خود را وارد کنید.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">ایمیل یا نام کاربری</span>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
              <i className="fas fa-user text-sm text-slate-500" aria-hidden="true" />
              <input
                className="h-12 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="manager"
                disabled={isLoading}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">رمز عبور</span>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
              <i className="fas fa-lock text-sm text-slate-500" aria-hidden="true" />
              <input
                type="password"
                className="h-12 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="رمز عبور"
                disabled={isLoading}
              />
            </div>
          </label>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-right-to-bracket'} aria-hidden="true" />
            {isLoading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
      </section>
    </main>
  );
}
