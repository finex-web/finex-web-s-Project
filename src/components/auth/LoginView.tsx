import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Logo } from '../common/Logo';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Database } from 'lucide-react';
import { getSupabaseCredentials } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('finexxweb@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { isConfigured } = getSupabaseCredentials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setLocalError('Access Denied. Only authorized FINEX WEB administrators may access this workspace.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0b] flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E52D27]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Private security badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-[#E52D27]" />
            <span>RESTRICTED INTERNAL OPERATING SYSTEM</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#121316] border border-white/10 rounded-lg p-7 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="lg" showTagline={false} />
            <h2 className="mt-4 text-lg font-bold text-white tracking-tight">
              Private Admin Authentication
            </h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-xs">
              Enter your authorized credentials to access clients, projects, finances, and team operations.
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/50 flex items-start gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="finexxweb@gmail.com"
                  className="w-full h-10 pl-9 pr-3 bg-[#191a1e] border border-white/10 rounded text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#E52D27] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-3 bg-[#191a1e] border border-white/10 rounded text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#E52D27] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold text-xs rounded flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating Admin...</span>
                ) : (
                  <>
                    <span>Unlock Operating System</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center text-[11px] text-zinc-400 space-y-1">
            <p className="font-mono">NO PUBLIC SIGNUP · NO REGISTRATION</p>
            <p className="text-zinc-400">
              Supabase RLS & PostgreSQL foreign key security enabled.
            </p>
          </div>
        </div>

        {/* Database backend badge */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <Database className="w-3 h-3 text-zinc-400" />
            <span>
              {isConfigured ? 'Connected to Supabase Live Instance' : 'Ready for Supabase PostgreSQL Link'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
