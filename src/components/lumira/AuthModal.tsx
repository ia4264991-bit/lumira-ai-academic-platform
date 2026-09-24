import React, { useState } from "react";
import { X, Mail, Lock, User, Sparkles, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Google sign in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,15,20,0.45)] p-4">
      <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-ink">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-muted hover:text-ink hover:bg-[#F1F1F6] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold tracking-tight text-ink">
            {isSignUp ? "Join Lumira Workspace" : "Welcome Back"}
          </h3>
          <p className="text-xs text-muted">
            {isSignUp 
              ? "Create your scholar profile to sync your Cards and Course Spaces" 
              : "Access your Cards, lecture notes, quizzes, and Sarah AI"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger-ink">
            <AlertCircle className="w-4 h-4 shrink-0 text-danger-ink mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#F6F6FA] border border-line text-ink font-display font-semibold rounded-xl text-sm flex items-center justify-center gap-3 transition shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-line flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-muted">or email</span>
          <div className="h-px bg-line flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Scholar Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                placeholder="scholar@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-canvas border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:opacity-90 text-white font-display font-semibold rounded-xl text-sm transition shadow-lg shadow-primary/30 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Scholar Account" : "Sign In"}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:opacity-80 font-medium"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>

          <button
            onClick={handleGuest}
            className="text-muted hover:text-ink"
          >
            Guest Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
