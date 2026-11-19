import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { friendlyAuthError, signIn, signUp } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QrVisual } from '../components/QrVisual';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Please enter your full name'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-600">{message}</p>;
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { session, profile, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const homePath = useMemo(() => (profile?.role === 'admin' ? '/admin' : '/dashboard'), [profile?.role]);

  if (!loading && session) {
    return <Navigate to={homePath} replace />;
  }

  const onLogin = loginForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
      toast('Welcome back! Signed in successfully.');
      navigate('/'); // routing guard sends the user to the right dashboard
    } catch (err) {
      setServerError(friendlyAuthError(err));
    }
  });

  const onSignup = signupForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signUp(values.email, values.password, values.fullName);
      toast('Account created! Welcome to QueueLess.');
      navigate('/dashboard');
    } catch (err) {
      setServerError(friendlyAuthError(err));
    }
  });

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setServerError(null);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img
          src="/images/centres/m-007.jpg"
          alt="Post office building"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="max-w-md text-4xl font-medium leading-[1.1] text-white">
            Your place in line, held on your phone.
          </h2>
          <div className="mt-8 flex items-center gap-5">
            <div className="rounded-lg bg-white p-2">
              <div className="h-16 w-16">
                <QrVisual />
              </div>
            </div>
            <div>
              <p className="font-mono text-4xl font-medium text-white">M-53</p>
              <p className="mt-1 text-sm text-navy-300">Meerut Head Post Office · 3 ahead</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex rounded-xl bg-navy-100 p-1">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                mode === 'login' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                mode === 'signup' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={onLogin} noValidate className="card space-y-5 p-7">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Welcome back</h1>
                <p className="mt-1 text-sm text-navy-500">Sign in to manage your queues and tokens.</p>
              </div>

              {serverError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                    {...loginForm.register('email')}
                  />
                </div>
                <FieldError message={loginForm.formState.errors.email?.message} />
              </div>

              <div>
                <label htmlFor="login-password" className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input px-10"
                    placeholder="Your password"
                    {...loginForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy-300 hover:text-navy-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={loginForm.formState.errors.password?.message} />
              </div>

              <button type="submit" className="btn-primary w-full !py-3" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-navy-500">
                New to QueueLess?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-bold text-electric-600 hover:underline">
                  Create a free account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={onSignup} noValidate className="card space-y-5 p-7">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Create your account</h1>
                <p className="mt-1 text-sm text-navy-500">Free forever for customers. Join in seconds.</p>
              </div>

              {serverError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="signup-name" className="label">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    className="input pl-10"
                    placeholder="Alex Morgan"
                    {...signupForm.register('fullName')}
                  />
                </div>
                <FieldError message={signupForm.formState.errors.fullName?.message} />
              </div>

              <div>
                <label htmlFor="signup-email" className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                    {...signupForm.register('email')}
                  />
                </div>
                <FieldError message={signupForm.formState.errors.email?.message} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-password" className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                    <input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      className="input pl-10"
                      placeholder="Min. 6 characters"
                      {...signupForm.register('password')}
                    />
                  </div>
                  <FieldError message={signupForm.formState.errors.password?.message} />
                </div>
                <div>
                  <label htmlFor="signup-confirm" className="label">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                    <input
                      id="signup-confirm"
                      type="password"
                      autoComplete="new-password"
                      className="input pl-10"
                      placeholder="Repeat password"
                      {...signupForm.register('confirmPassword')}
                    />
                  </div>
                  <FieldError message={signupForm.formState.errors.confirmPassword?.message} />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full !py-3" disabled={signupForm.formState.isSubmitting}>
                {signupForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-sm text-navy-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-bold text-electric-600 hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
