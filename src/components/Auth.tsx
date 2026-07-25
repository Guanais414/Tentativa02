import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mascot } from './Mascot';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        // Sign up success — session is created automatically (email confirmation OFF)
        onAuthSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.');
      } else if (err.message?.includes('already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (err.message?.includes('Email rate limit')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto">
      <div className="w-full animate-fade-in">
        {/* Logo / Mascot */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce-slow">
            <Mascot type="otter" size={100} mood="excited" />
          </div>
          <h1 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Dango
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Your personal life manager
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-5 bg-gray-200 dark:bg-gray-800 rounded-2xl p-1">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'signin' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'signup' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-green-400 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl pl-10 pr-10 py-3 outline-none focus:ring-2 ring-green-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 rounded-2xl p-3 animate-slide-up">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {mode === 'signup' ? 'Creating account...' : 'Signing in...'}</>
              ) : (
                <>{mode === 'signup' ? 'Create Account' : 'Sign In'}</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-green-600 font-bold"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your data is securely stored and private to your account.
        </p>
      </div>
    </div>
  );
}
