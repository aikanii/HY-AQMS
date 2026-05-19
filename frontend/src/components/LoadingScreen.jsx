import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [fade, setFade] = useState(false);

  // Quick fade in effect
  useEffect(() => {
    setTimeout(() => setFade(true), 50);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle at center, #1B4552 0%, var(--bg) 100%)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      color: 'var(--text)', fontFamily: '"Times New Roman", Times, serif',
      opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease-in-out',
      overflow: 'hidden'
    }}>
      {/* Wind & Technology Background Effects */}
      <div className="loading-tech-bg" />
      <div className="wind-gust" style={{ top: '15%', animationDuration: '4s', animationDelay: '0s' }} />
      <div className="wind-gust" style={{ top: '55%', animationDuration: '5.5s', animationDelay: '2s' }} />
      <div className="wind-gust" style={{ top: '75%', animationDuration: '3.5s', animationDelay: '1s' }} />
      <div className="particles-layer" />

      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '3.5rem' }}>
        {/* Animated Environment Data Rings */}
        <div className="wave-ring" style={{ animationDelay: '0s' }} />
        <div className="wave-ring" style={{ animationDelay: '0.6s' }} />
        <div className="wave-ring" style={{ animationDelay: '1.2s' }} />
        
        {/* Core Sensor / Leaf icon in center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '70px', height: '70px', background: 'var(--brand-gradient)',
          borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 0 40px rgba(2, 239, 240, 0.4)',
          fontSize: '2.2rem', zIndex: 10
        }}>
          🍃
        </div>
      </div>
      
      <h1 style={{ 
        margin: '0 0 1rem 0', fontSize: '2.4rem', fontWeight: '800', 
        letterSpacing: '2px', textAlign: 'center',
        background: 'linear-gradient(135deg, #FFFFFF 30%, var(--accent))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        maxWidth: '80%'
      }}>
        Hyperlocal Air Quality Monitoring System
      </h1>
      <h3 style={{ 
        margin: 0, fontSize: '1rem', fontWeight: '600', 
        color: 'var(--accent)', letterSpacing: '8px', textTransform: 'uppercase',
        opacity: 0.8
      }}>
        Connecting Sensors, Connecting Life
      </h3>
      
      {/* Dynamic dots indicating processing */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '3rem' }}>
        <div className="loading-dot" style={{ animationDelay: '0s' }} />
        <div className="loading-dot" style={{ animationDelay: '0.2s' }} />
        <div className="loading-dot" style={{ animationDelay: '0.4s' }} />
      </div>
      </div>
      
      <style>{`
        @keyframes expandWave {
          0% { transform: scale(0.4); opacity: 1; border-width: 4px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        .wave-ring {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 2px solid var(--accent);
          border-radius: 50%;
          animation: expandWave 2s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        }
        .loading-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--accent);
          animation: bounceDot 1s ease-in-out infinite;
        }

        /* Ambient Wind & Tech Classes */
        .loading-tech-bg {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: linear-gradient(rgba(2, 239, 240, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(2, 239, 240, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 1; opacity: 0.5;
          pointer-events: none;
        }

        @keyframes windSweep {
          0% { transform: translateX(-50vw); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        
        .wind-gust {
          position: absolute;
          left: -40vw;
          width: 70vw;
          height: 140px;
          background: linear-gradient(90deg, transparent, rgba(2, 239, 240, 0.6), transparent);
          filter: blur(15px);
          border-radius: 60px;
          z-index: 2;
          animation: windSweep linear infinite;
          pointer-events: none;
        }

        @keyframes drift {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }

      `}</style>
    </div>
  );
};

export default LoadingScreen;
