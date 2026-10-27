import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  UploadCloud, 
  RefreshCw, 
  ArrowRight,
  Clock,
  Server,
  Info
} from 'lucide-react';
import { API_V1, API_BASE_URL, DEFAULT_CLOUD_BACKEND, setBackendBaseUrl } from '../config';

interface SystemStats {
  total_processed: number;
  high_confidence_count: number;
  high_confidence_rate: number;
  whitelisted_matches: number;
  watchlist_alerts: number;
  tesseract_version: string;
  yolo_model_loaded: boolean;
}

interface RecognitionRecord {
  id: number;
  plate_text: string;
  confidence: number;
  status: string;
  timestamp: string;
  vehicle?: {
    owner_name: string;
    vehicle_model: string;
  };
}

const DEMO_STATS: SystemStats = {
  total_processed: 16,
  high_confidence_count: 15,
  high_confidence_rate: 93.8,
  whitelisted_matches: 11,
  watchlist_alerts: 2,
  tesseract_version: 'Tesseract OCR 5.5.0-ready',
  yolo_model_loaded: true
};

const DEMO_HISTORY: RecognitionRecord[] = [
  {
    id: 101,
    plate_text: 'MH12AB1234',
    confidence: 0.962,
    status: 'whitelisted',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 102,
    plate_text: 'DL8CAF5021',
    confidence: 0.915,
    status: 'watchlist_alert',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString()
  },
  {
    id: 103,
    plate_text: 'KA01MJ9999',
    confidence: 0.948,
    status: 'whitelisted',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString()
  },
  {
    id: 104,
    plate_text: 'HR26DQ5555',
    confidence: 0.884,
    status: 'review_required',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<RecognitionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setIsWakingUp(false);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        setIsWakingUp(true);
      }, 3500);

      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_V1}/stats`, { signal: controller.signal }),
        fetch(`${API_V1}/history?limit=5`, { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        setIsDemoMode(false);
      }
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentHistory(historyData);
      }
    } catch {
      // Gracefully switch to Demo Preview Mode so client's screen is always populated
      setIsDemoMode(true);
      setStats(DEMO_STATS);
      setRecentHistory(DEMO_HISTORY);
    } finally {
      setLoading(false);
      setIsWakingUp(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitchToCloud = () => {
    setBackendBaseUrl(DEFAULT_CLOUD_BACKEND);
    window.location.reload();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'whitelisted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Whitelisted</span>;
      case 'watchlist_alert':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Watchlist Alert</span>;
      case 'review_required':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Review Required</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Valid</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h2>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Demo Preview Mode
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">Real-time OpenCV license plate recognition and vehicle access stats.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData}
            className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/recognize')}
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Analyze Plate Image
          </button>
        </div>
      </div>

      {/* Backend Status Notice Banner */}
      {isDemoMode && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Live Backend Server Connecting ({API_BASE_URL})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Displaying sample metrics. Cloud services (e.g. Render) take ~30–50s on initial cold start, or local servers must be active on this device.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {API_BASE_URL.includes('localhost') && (
              <button
                onClick={handleSwitchToCloud}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors shadow-2xs"
              >
                Connect to Cloud Backend
              </button>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors flex items-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Retry Live Sync
            </button>
          </div>
        </div>
      )}

      {isWakingUp && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center text-xs text-indigo-800">
          <Server className="w-4 h-4 mr-2 text-indigo-600 animate-pulse" />
          <span>Waking up remote Python FastAPI server... please wait a few seconds.</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recognized</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.total_processed ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Processed image records</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Confidence Rate</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.high_confidence_rate ?? 0}%</div>
            <p className="text-xs text-slate-500 mt-1">{stats?.high_confidence_count ?? 0} records &ge; 50% score</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Whitelisted Passes</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.whitelisted_matches ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Matched allowed vehicles</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Watchlist Alerts</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.watchlist_alerts ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Flagged vehicle alerts</p>
          </div>
        </div>
      </div>

      {/* Diagnostics & Info Widget */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold">OpenCV & Tesseract OCR Pipeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine Version: <span className="text-indigo-300 font-mono">{stats?.tesseract_version || 'Tesseract 5.5.0-ready'}</span> | 
              YOLO Detector: <span className={stats?.yolo_model_loaded ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {stats?.yolo_model_loaded ? 'Active (YOLOv8 Plate Model)' : 'Haar Cascade Fallback'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            System Diagnostics
          </button>
        </div>
      </div>

      {/* Recent Recognitions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Recognitions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest license plates detected by backend pipeline</p>
          </div>
          <button 
            onClick={() => navigate('/history')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            View All Logs <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentHistory.map((record) => (
            <div key={record.id} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="px-3.5 py-1.5 inline-flex text-base font-mono font-bold rounded-lg bg-slate-900 text-amber-400 border border-slate-800 shadow-xs">
                  {record.plate_text}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(record.status)}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-slate-500 mb-1">Confidence Score</div>
                <div className={`text-base font-bold ${record.confidence >= 0.6 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {(record.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}

          {recentHistory.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium">No recognition logs available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Go to the Recognition tab to upload a vehicle image.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
