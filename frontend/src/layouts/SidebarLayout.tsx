import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  LogOut, 
  Car, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Activity,
  Search,
  Server,
  Globe,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { 
  API_V1, 
  API_BASE_URL, 
  setBackendBaseUrl, 
  resetBackendBaseUrl, 
  DEFAULT_CLOUD_BACKEND, 
  DEFAULT_LOCAL_BACKEND 
} from '../config';
import { useAuth } from '../context/AuthContext';

export default function SidebarLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [urlInput, setUrlInput] = useState(API_BASE_URL);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_V1}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleSaveServer = (newUrl: string) => {
    setBackendBaseUrl(newUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleResetServer = () => {
    resetBackendBaseUrl();
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg mr-3 border border-indigo-500/30">
            <Car className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide leading-tight">AutoLPR Pro</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Computer Vision OCR</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Main Operations
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink 
                  to="/"
                  end
                  className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/recognize"
                  className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  <UploadCloud className="w-4 h-4 mr-3" />
                  Recognition & Upload
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/history"
                  className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  History & Logs
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Management
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink 
                  to="/vehicles"
                  className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  Vehicle Registry
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/settings"
                  className={({isActive}) => `w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings & Diagnostics
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs">
                {user ? user.username.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.username || 'admin'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-xs z-10">
          <div className="flex items-center text-slate-400 text-sm">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-slate-400 text-xs">Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-600">/history</kbd> to search logs</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Pill */}
            <div className="flex items-center">
              {apiOnline === true && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  FastAPI & Tesseract Ready
                </span>
              )}
              {apiOnline === false && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                  Backend Idle / Offline
                </span>
              )}
              {apiOnline === null && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <Activity className="w-3 h-3 mr-1.5 animate-spin" />
                  Connecting...
                </span>
              )}
            </div>

            {/* Server Config Modal Trigger */}
            <button
              onClick={() => setShowServerModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Configure API Server URL"
            >
              <Server className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              API Server
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </div>
      </main>

      {/* Backend Server Configuration Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Backend Server Configuration</h3>
                  <p className="text-xs text-slate-500">Configure which FastAPI backend this browser connects to.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowServerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Server Info */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Active Endpoint</div>
              <div className="text-xs font-mono text-slate-800 break-all select-all font-semibold">{API_BASE_URL}</div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-slate-500 mr-2">Status:</span>
                {apiOnline === true ? (
                  <span className="text-emerald-600 font-semibold flex items-center"><Check className="w-3.5 h-3.5 mr-1" /> Connected & Ready</span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center">Offline / Waking up</span>
                )}
                <button 
                  onClick={checkHealth}
                  disabled={checking}
                  className="ml-auto inline-flex items-center text-[11px] text-indigo-600 hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
                  Check Now
                </button>
              </div>
            </div>

            {/* Preset Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Quick Preset Servers
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setUrlInput(DEFAULT_CLOUD_BACKEND)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs ${
                    urlInput === DEFAULT_CLOUD_BACKEND 
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center mb-1">
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Cloud Render
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Render hosted backend</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUrlInput(DEFAULT_LOCAL_BACKEND)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs ${
                    urlInput === DEFAULT_LOCAL_BACKEND 
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center mb-1">
                    <Server className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Localhost
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">http://localhost:8000</div>
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom Endpoint URL (e.g. ngrok / cloudflared / VPS)
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://your-backend-url.com"
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">Saves into browser local storage for persistent connection.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetServer}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                Reset Default
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveServer(urlInput)}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Connecting...
                    </>
                  ) : (
                    'Save & Reconnect'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
