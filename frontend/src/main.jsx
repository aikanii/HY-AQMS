import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import axios from 'axios'
import App from './App.jsx'

const initApp = async () => {
  // Only fetch external overrides if we are running in the Vercel cloud environment.
  // This prevents local development/containers from being hijacked by stale/dead public tunnel URLs.
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    // 1. Try to load dynamic tunnel URL from raw GitHub first
    try {
      const response = await fetch('https://raw.githubusercontent.com/aikanii/HY-AQMS/main/frontend/public/api_url.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        if (data && data.url) {
          localStorage.setItem('aqms_api_url', data.url);
        }
      }
    } catch (err) {
      console.warn('[HY-AQMS] Could not fetch raw GitHub API URL, using local config fallbacks.');
    }

    // 2. Fetch static public config.json containing the production VPS/Render URL
    try {
      const response = await fetch('/config.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        if (data && data.api_url) {
          localStorage.setItem('aqms_production_api_url', data.api_url);
        }
      }
    } catch (err) {
      console.warn('[HY-AQMS] Could not fetch public config.json, using defaults.');
    }
  } else {
    // On localhost, we clear any stale production/tunnel overrides to ensure the app hits the local backend.
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aqms_api_url');
      localStorage.removeItem('aqms_production_api_url');
    }
  }

  // Dynamically import config after localStorage is updated
  const { API_URL } = await import('./config');
  axios.defaults.baseURL = API_URL;

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

initApp();
