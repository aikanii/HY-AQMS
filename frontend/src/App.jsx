import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import { API_URL } from './config'

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Components
import Dashboard from './components/Dashboard'
import MapView from './components/MapView'
import Devices from './components/Devices'
import Simulation from './components/Simulation'
import Docs from './components/Docs'
import Analytics from './components/Analytics'
import LoadingScreen from './components/LoadingScreen'
import DigitalClock from './components/DigitalClock'
import RegionSelector from './components/RegionSelector'
import DataFlow from './components/DataFlow'

// ---------------------------------------------------------------------------
// AccessNotification — premium pop-up for auth state changes
// ---------------------------------------------------------------------------
const AccessNotification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className="access-notification">
      <h2>{type === 'login' ? '✔ ACCESS GRANTED' : '👁 PUBLIC VIEW'}</h2>
      <p>{message}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// LoginSection — reads/writes auth via context
// ---------------------------------------------------------------------------
const LoginSection = ({ setShowSplash, setNotify }) => {
  const { isLoggedIn, isAdmin, username, login, logout } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowSplash(true); // Trigger global splash screen on login
    
    try {
      const res = await axios.post('/api/auth/login', credentials);
      
      // Delay to let the beautiful splash screen play during the login transition
      setTimeout(() => {
        login(res.data.token);
        setCredentials({ username: '', password: '' });
        setShowSplash(false);
        setNotify({ type: 'login', message: 'Administrator Session Established' });
        setTimeout(() => setNotify(null), 4000);
      }, 5000);
      
    } catch {
      setShowSplash(false);
      alert('Login failed: Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setNotify({ type: 'logout', message: 'Returned to General Public View' });
    setTimeout(() => setNotify(null), 4000);
  };

  if (isLoggedIn) {

    return (
      <div style={{ padding: '1rem', margin: '0 1rem 1rem 1rem', background: 'var(--overlay-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
          {/* Avatar */}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAdmin ? 'var(--brand-gradient)' : '#475569', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0 }}>
            {username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username ?? 'User'}</p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: isAdmin ? 'var(--accent)' : 'var(--text-dim)' }}>
              {isAdmin ? '🔑 Administrator' : '👁 Viewer'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '0.5rem', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
        >
          Logout Session
        </button>
      </div>

    );
  }

  return (
    <div style={{ padding: '1rem', margin: '0 1rem 1rem 1rem', background: 'var(--overlay-bg)', borderRadius: '12px' }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ width: '100%', background: 'transparent', border: '1px solid rgba(2, 239, 240, 0.3)', color: 'var(--accent)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
      >
        <span>{isExpanded ? '✖ CANCEL' : '🔑 ADMIN LOGIN'}</span>
      </button>

      <div className={`login-expand-container ${isExpanded ? 'expanded' : ''}`}>
        <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>RESTRICTED ACCESS</p>
        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={credentials.username}
            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: '6px', border: 'none', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', marginBottom: '0.8rem', borderRadius: '6px', border: 'none', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.6rem', background: loading ? '#2c3e50' : 'var(--accent)', color: '#0F282F', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            {loading ? 'Authenticating…' : 'Initialize Command Link'}
          </button>
        </form>
      </div>
    </div>
  );
};


// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
const AppInner = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('map');

  const [readings, setReadings] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const [showRegionSelect, setShowRegionSelect] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem('aqms_region') || 'all');
  const [notify, setNotify] = useState(null);

  // Show splash on initial boot, then Region Selector if no region is saved
  useEffect(() => {
    const t = setTimeout(() => {
      setShowSplash(false);
      // If no region is saved or user specifically asked for "every startup", we show it.
      // The prompt says "every startup or just opening", so we show it unless we want to be more subtle.
      // I'll show it if selectedRegion is 'all' or just always if it's a new session.
      setShowRegionSelect(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('aqms_theme', 'dark');
  }, []);

  // Build the nav tab list — admins see Simulation, viewers do not
  const NAV_TABS = [
    { id: 'dashboard',  label: '📊 Dashboard' },
    { id: 'analytics',  label: '📈 Analytics' },
    { id: 'map',        label: '🗺️ AQI Map' },
    { id: 'devices',    label: '🔌 Devices' },
    ...(isAdmin ? [
      { id: 'simulation', label: '🚀 Simulation' },
      { id: 'dataflow',   label: '🔄 Pipeline' },
    ] : []),
    { id: 'docs',       label: '📚 Documentation' },
  ];

  // If the active tab is no longer visible (e.g. after logout), reset to map
  useEffect(() => {
    const ids = NAV_TABS.map(t => t.id);
    if (!ids.includes(activeTab)) setActiveTab('map');
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [readingsRes, devicesRes] = await Promise.all([
          axios.get('/api/readings/latest'),
          axios.get('/api/devices')
        ]);
        setReadings(readingsRes.data);
        setDevices(devicesRes.data);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchInitial();

    const socket = io(API_URL, { path: '/socket.io/' });
    socket.on('new_reading', (payload) => {
      setReadings(prev => {
        const index = prev.findIndex(r => r.device_id === payload.device_id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = payload;
          return updated;
        }
        return [...prev, payload];
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    localStorage.setItem('aqms_region', region);
    setShowRegionSelect(false);
  };

  // Filtered Data Logic
  const filteredReadings = readings.filter(r => {
    if (selectedRegion === 'all') return true;
    const device = devices.find(d => d.device_id === r.device_id);
    return device?.region === selectedRegion;
  });

  // Note: We render Simulation unconditionally (if admin) but hide it when inactive,
  // so the auto-pilot interval and log state persist in the background.
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard readings={filteredReadings} />;
      case 'analytics':  return <Analytics />;
      case 'map':        return <MapView readings={filteredReadings} />;
      case 'devices':    return <Devices isAdmin={isAdmin} readings={readings} />;
      case 'dataflow':   return <DataFlow readings={readings} />;
      case 'docs':       return <Docs />;
      default:           return activeTab === 'simulation' ? null : <MapView readings={filteredReadings} />;
    }
  };

  return (
    <>
      {showSplash && <LoadingScreen />}
      {showRegionSelect && !showSplash && <RegionSelector onSelect={handleRegionSelect} />}
      <AccessNotification message={notify?.message} type={notify?.type} />
      
      {/* Global Atmospheric Tech Layers */}
      <div className="bg-overlay" />
      <div className="tech-bg" />
      <div className="atm-glow glow-1" />
      <div className="atm-glow glow-2" />
      
      <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', background: 'transparent', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ width: '280px', border: 'none', borderRadius: '0', borderRight: '1px solid var(--border)', boxShadow: '5px 0 30px var(--shadow)', zIndex: 10, display: 'flex', flexDirection: 'column', background: 'var(--panel)' }}>
        <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '1px', textShadow: '0 0 10px rgba(2, 239, 240, 0.5)' }}>HY-AQMS</h2>
          <div style={{ background: 'var(--accent-bg-hover)', border: '1px solid rgba(2, 239, 240, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-block', marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📍 {selectedRegion === 'all' ? 'City-wide View' : selectedRegion}
            </span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '2rem 1rem' }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-btn hover-lift ${isActive ? 'active' : ''}`}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  marginBottom: '1rem',
                  background: isActive ? 'var(--accent-bg-hover)' : 'var(--panel)',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-border)' : 'var(--border)',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: isActive ? '0 0 20px rgba(2, 239, 240, 0.15)' : '0 4px 6px var(--shadow)',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <LoginSection setShowSplash={setShowSplash} setNotify={setNotify} />

        <div style={{ padding: '1.5rem 2rem', background: 'var(--overlay-bg)', borderTop: '1px solid var(--border)' }}>
          <div>
            <DigitalClock />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '1px', marginTop: '1rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 10px #2ecc71' }} />
            NETWORK ONLINE
          </div>
        </div>
      </aside>

      {/* HUD Main content */}
      <main className="hud-wrapper">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% -20%, var(--accent-bg) 0%, transparent 50%)', zIndex: 0 }} />
        <div style={{ flex: 1, zIndex: 1, position: 'relative', overflowY: 'auto' }}>
          {renderContent()}
          {isAdmin && (
            <div style={{ display: activeTab === 'simulation' ? 'block' : 'none', height: '100%' }}>
              <Simulation />
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
};

// Wrap AppInner in the provider so every child can call useAuth()
const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
