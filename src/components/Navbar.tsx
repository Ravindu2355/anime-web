import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { languages, LanguageCode } from "../services/languages";
import { isFirebaseConfigured, reinitializeFirebase, saveFirebaseConfig, deleteFirebaseConfig } from "../services/firebase";
import { 
  Play, 
  Search, 
  User, 
  LogOut, 
  Globe, 
  Download, 
  Tv, 
  Heart, 
  Menu, 
  X, 
  Database, 
  Wifi, 
  WifiOff, 
  Settings, 
  Sliders, 
  Flame, 
  Group 
} from "lucide-react";

interface NavbarProps {
  onSearchQueryChange: (query: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchQueryChange, 
  currentView, 
  setCurrentView, 
  onOpenAuth 
}) => {
  const { user, language, setLanguage, t, offlineMode, setOfflineMode, offlineEpisodes } = useApp();
  const [searchVal, setSearchVal] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customized Firebase Config Inputs
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");
  const [configStatus, setConfigStatus] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearchQueryChange(val);
  };

  const handleLangSelect = (code: LanguageCode) => {
    setLanguage(code);
    setLangOpen(false);
  };

  const activeLang = languages.find((l) => l.code === language) || languages[0];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId || !appId) {
      setConfigStatus("⚠️ Please fill in at least API Key, Project ID, and App ID!");
      return;
    }
    saveFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    });
    const connected = reinitializeFirebase();
    if (connected) {
      setConfigStatus("✅ Firebase Connected Successfully! Refreshing state...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setConfigStatus("❌ Failed to connect. Check credentials accuracy.");
    }
  };

  const handleDisconnectFirebase = () => {
    deleteFirebaseConfig();
    setConfigStatus("ℹ️ Custom Firebase Config cleared. Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const navItems = [
    { id: "home", label: t.home, icon: Tv },
    { id: "watchlist", label: t.watchlist, icon: Heart, show: !!user },
    { id: "downloads", label: t.downloads, icon: Download, badge: offlineEpisodes.length },
    { id: "party", label: t.watchParty, icon: Flame },
    { id: "admin", label: t.adminDashboard, icon: Sliders, show: user?.role === "admin" }
  ];

  return (
    <>
      <nav id="navbar" className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800 text-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setCurrentView("home"); setSearchVal(""); onSearchQueryChange(""); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-600/20">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-gray-100 to-pink-500 bg-clip-text text-transparent">
                {t.appName}
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
              {navItems.map((item) => {
                if (item.show === false) return null;
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => { setCurrentView(item.id); setSearchVal(""); onSearchQueryChange(""); }}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-pink-600/10 text-pink-500 border border-pink-500/20 shadow-sm" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {!!item.badge && (
                      <span className="bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Search Bar */}
            <div className="hidden sm:block flex-1 max-w-xs mx-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                id="search-input"
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                placeholder={t.searchPlaceholder}
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-800 rounded-lg bg-gray-900/60 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white transition-all"
              />
            </div>

            {/* Quick Actions (Offline mode, Lang, Firebase Status, User Profile) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Sync Status / Custom Firebase Config button */}
              <button 
                id="btn-firebase-status"
                onClick={() => setConfigOpen(!configOpen)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isFirebaseConfigured() 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
                title={isFirebaseConfigured() ? "Firebase Synced" : "Running locally (Offline fallback). Click to configure Cloud Sync!"}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{isFirebaseConfigured() ? "Cloud Active" : "Local DB"}</span>
              </button>

              {/* Offline mode toggler */}
              <button
                id="btn-offline-mode"
                onClick={() => setOfflineMode(!offlineMode)}
                className={`flex items-center space-x-1 p-2 rounded-lg border transition-all ${
                  offlineMode 
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-500" 
                    : "bg-gray-800/40 border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white"
                }`}
                title={offlineMode ? "Network Blocked (Offline Mode)" : "Connected to Server"}
              >
                {offlineMode ? <WifiOff className="w-4 h-4 text-rose-500" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  id="btn-lang-selector"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center space-x-1 p-2 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800/80 transition"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold hidden md:inline">{activeLang.flag}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-gray-950 border border-gray-800 shadow-xl overflow-hidden py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 text-xs hover:bg-gray-900 transition-colors ${
                          language === lang.code ? "text-pink-500 font-bold bg-pink-600/5" : "text-gray-300"
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-sm">{lang.flag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    id="btn-user-menu"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full border border-gray-800 hover:border-gray-700 transition"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-7 h-7 rounded-full bg-gray-800"
                    />
                    <span className="text-xs font-semibold text-gray-300 hidden md:inline max-w-[80px] truncate">
                      {user.username}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-950 border border-gray-800 shadow-xl overflow-hidden py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-xs text-gray-500">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.username}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 capitalize">
                          {user.role} Account
                        </span>
                      </div>
                      
                      <button
                        onClick={() => { setProfileOpen(false); setCurrentView("watchlist"); }}
                        className="flex items-center space-x-2.5 w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-900 transition"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span>{t.watchlist}</span>
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); setCurrentView("downloads"); }}
                        className="flex items-center space-x-2.5 w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-900 transition"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                        <span>{t.downloads}</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          localStorage.removeItem("local_active_uid");
                          window.location.reload();
                        }}
                        className="flex items-center space-x-2.5 w-full text-left px-4 py-3 text-xs text-rose-400 hover:bg-rose-500/5 transition border-t border-gray-900"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-login-trigger"
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-pink-600/20 hover:shadow-pink-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.login}</span>
                </button>
              )}

              {/* Mobile Menu Toggler */}
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-950 border-b border-gray-900 px-4 py-3 space-y-2">
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                placeholder={t.searchPlaceholder}
                className="block w-full pl-9 pr-3 py-2 border border-gray-800 rounded-lg bg-gray-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            {navItems.map((item) => {
              if (item.show === false) return null;
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                    setSearchVal("");
                    onSearchQueryChange("");
                  }}
                  className={`flex items-center space-x-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive 
                      ? "bg-pink-600 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                  {!!item.badge && (
                    <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* FIREBASE CONFIG PANEL (INTEGRITY SETUP) */}
      {configOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0E1322] border border-gray-800 max-w-lg w-full rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <button
              onClick={() => setConfigOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-black text-white">Firebase cloud Database Connection</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              To host on <strong className="text-white">GitHub Pages</strong> with complete real-time multi-device sync, you can input your Firebase project credentials here. They are saved securely in your browser's client storage.
            </p>

            {isFirebaseConfigured() ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-5 text-emerald-400 text-xs">
                <p className="font-bold flex items-center mb-1">
                  <Wifi className="w-4 h-4 mr-1.5" /> Cloud Sync Active
                </p>
                Your application is successfully writing/reading watchlogs, parties, and profiles from your Firestore Database!
                <button
                  onClick={handleDisconnectFirebase}
                  className="mt-3 block text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase underline"
                >
                  Disconnect Firebase Cloud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-3.5 mb-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">API Key *</label>
                    <input
                      type="password"
                      placeholder="AIzaSyA..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Project ID *</label>
                    <input
                      type="text"
                      placeholder="anistream-123"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Auth Domain</label>
                    <input
                      type="text"
                      placeholder="anistream-123.firebaseapp.com"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">App ID *</label>
                    <input
                      type="text"
                      placeholder="1:123456:web:abcd"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 to-amber-500 py-2.5 rounded-lg text-xs font-black text-white hover:opacity-90 transition uppercase tracking-wider"
                >
                  Establish Database Connection
                </button>
              </form>
            )}

            {configStatus && (
              <p className="text-xs font-bold text-center mt-3 text-amber-400">{configStatus}</p>
            )}

            <div className="border-t border-gray-800/60 mt-4 pt-4 text-[10px] text-gray-500 leading-relaxed">
              💡 **No setup? No worries!** The streaming app runs with a fully operational local database (IndexedDB-driven) with complete data retention if you do not input custom credentials. Perfect for immediate previews!
            </div>
          </div>
        </div>
      )}
    </>
  );
};
