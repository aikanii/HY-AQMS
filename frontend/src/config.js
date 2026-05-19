// Centralized API configuration for HY-AQMS
// In production, these will be set via Vercel/CI-CD environment variables.
// In local development, they fallback to the current origin (localhost).

const isProd = import.meta.env.PROD;

// VITE_API_URL should be set in Vercel to something like: https://api.yourdomain.com
// If not set, it falls back to window.location.origin (useful for the local Docker setup)
export const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Clean trailing slashes
export const API_URL = API_BASE_URL.replace(/\/$/, '');

console.log(`[HY-AQMS] Initialized with API URL: ${API_URL}`);
