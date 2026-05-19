import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import axios from 'axios'
import { API_URL } from './config'
import App from './App.jsx'

// Configure global axios defaults for cross-origin support (Vercel)
axios.defaults.baseURL = API_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
