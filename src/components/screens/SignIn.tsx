import { Loader2, LogIn } from 'lucide-react';

interface SignInProps {
  onSignIn: () => Promise<void>;
  isSigningIn: boolean;
  error: string | null;
  disabled?: boolean;
}

export function SignIn({ onSignIn, isSigningIn, error, disabled = false }: SignInProps) {
  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-xl p-7">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="AtollFeeNa logo"
            className="w-20 h-20 rounded-3xl object-cover shadow-sm bg-white border border-slate-100 mb-5"
          />
          <p className="text-xs uppercase tracking-[0.22em] font-bold text-maldives-lagoon mb-2">Maruhabaa</p>
          <h1 className="text-2xl font-display font-bold text-maldives-deep tracking-tight">Sign in to AtollFeeNa</h1>
          <p className="text-sm text-slate-500 mt-3 mb-7">
            Use your Google account to sync dives, marine sightings, and profile data.
          </p>
        </div>

        <button
          onClick={onSignIn}
          disabled={disabled || isSigningIn}
          className="w-full min-h-[48px] px-5 rounded-2xl bg-maldives-deep text-white font-semibold flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting Google...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
