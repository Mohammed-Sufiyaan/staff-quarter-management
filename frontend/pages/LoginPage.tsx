
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void> | void;
  error?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setLocalError(null);
      await onLogin(email, password);
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-building-circle-check text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold">Staff Quarters MS</h1>
            <p className="text-indigo-100 mt-1">Institutional Facility Management</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Work Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {(error || localError) && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm">
                {error || localError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-600 font-semibold hover:underline">Forgot Password?</button>
            </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Signing in...' : 'Log In'}
                {!isSubmitting && <i className="fa-solid fa-arrow-right"></i>}
              </button>
            </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Selectable Demo Accounts</p>
            <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => { setEmail('admin@example.com'); setPassword('password'); }} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">ADMIN</button>
                <button onClick={() => { setEmail('staff@example.com'); setPassword('password'); }} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">STAFF</button>
                <button onClick={() => { setEmail('user@example.com'); setPassword('password'); }} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">VIEWER</button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-sm">
          Supports English & Gujarati Interface | Version 1.0.4
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
