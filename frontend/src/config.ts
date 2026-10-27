// Backend API Configuration with Dynamic Host & LocalStorage Override
export const DEFAULT_CLOUD_BACKEND = 'https://license-plate-recognition-m6tu.onrender.com';
export const DEFAULT_LOCAL_BACKEND = 'http://localhost:8000';

export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('AUTOLPR_BACKEND_URL');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }

    // If accessing via localhost / local development, default to local FastAPI
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_LOCAL_BACKEND;
    }
  }

  // Remote / Netlify production default
  return (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_CLOUD_BACKEND;
}

export function setBackendBaseUrl(newUrl: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = newUrl.trim().replace(/\/+$/, '');
    if (cleanUrl) {
      localStorage.setItem('AUTOLPR_BACKEND_URL', cleanUrl);
    } else {
      localStorage.removeItem('AUTOLPR_BACKEND_URL');
    }
  }
}

export function resetBackendBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('AUTOLPR_BACKEND_URL');
  }
}

export const API_BASE_URL = getBackendBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;
