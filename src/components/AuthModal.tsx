import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { loginUser, registerUser } from "../services/firebase";
import { X, Sparkles, LogIn, Mail, Lock, User, Info } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
        setStatusMsg("✅ Successful login! Synchronizing profile...");
      } else {
        await registerUser(email, password, username);
        setStatusMsg("✅ Registration complete! Welcome to the otaku club!");
      }
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to bind firebase config updates safely
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`❌ Error: ${err.message || "Failed authentication"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-root" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#0E1322] border border-gray-800 max-w-sm w-full rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        {/* Glow effects */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Titles */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-pink-600/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-pink-500" />
          </div>
          <h3 className="text-lg font-black text-white">
            {isLogin ? t.login : t.signUp}
          </h3>
          <p className="text-xs text-gray-400">
            {isLogin ? "Welcome back, Anime Watcher!" : "Create an account to track progress & sync watchlists."}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <input
                id="auth-username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 text-white"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-500" />
            </div>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 text-white"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-500" />
            </div>
            <input
              id="auth-password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-amber-500 py-3 rounded-xl text-xs font-black text-white hover:opacity-90 transition-all uppercase tracking-wider shadow-lg shadow-pink-600/10 cursor-pointer"
          >
            {loading ? "Authenticating..." : isLogin ? t.login : t.signUp}
          </button>
        </form>

        {statusMsg && (
          <p className="text-xs font-bold text-center mt-3 text-amber-400 leading-normal">{statusMsg}</p>
        )}

        {/* Footer toggles */}
        <div className="text-center pt-4 mt-5 border-t border-gray-900/60 text-xs">
          <button
            onClick={() => { setIsLogin(!isLogin); setStatusMsg(null); }}
            className="text-gray-400 hover:text-white font-medium cursor-pointer"
          >
            {isLogin ? "New to AniStream? Create Account" : "Already registered? Sign In"}
          </button>
        </div>

        {/* Live Admin credential notice for quick testing */}
        {isLogin && (
          <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl mt-4 text-[10px] text-amber-500/80 flex items-start space-x-1.5 leading-normal">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Immediate Preview Notice:</strong> Enter any email and password! Entering <strong>admin@anistream.com</strong> automatically opens the advanced Admin Panel features for testing.
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
