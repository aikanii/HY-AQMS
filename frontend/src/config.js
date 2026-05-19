// Centralized API configuration for HY-AQMS
// In production, these will be set via Vercel/CI-CD environment variables.
// In local development, they fallback to the current origin (localhost).

const isProd = import.meta.env.PROD;

// VITE_API_URL should be set in Vercel to something like: https://api.yourdomain.com
// If not set, it falls back to window.location.origin (useful for the local Docker setup)
const getApiBaseUrl = () => {
  // 1. Manual user override via LocalStorage (e.g. settings gear)
  if (typeof window !== 'undefined') {
    const localOverride = window.localStorage.getItem('aqms_api_url');
    if (localOverride) return localOverride;
  }

  // 2. Production endpoint configured globally via public/config.json
  if (typeof window !== 'undefined') {
    const prodConfigUrl = window.localStorage.getItem('aqms_production_api_url');
    // Ensure it is a valid non-empty string and not the placeholder before using it
    if (prodConfigUrl && prodConfigUrl !== 'https://dashboard.yourdomain.com') {
      return prodConfigUrl;
    }
  }

  // 3. Build-time environment variable VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 4. Default fallback: on Vercel preview, target local dev backend
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return 'http://localhost:3000';
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

// Clean trailing slashes
export const API_URL = API_BASE_URL.replace(/\/$/, '');

console.log(`[HY-AQMS] Initialized with API URL: ${API_URL}`);
