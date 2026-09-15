import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Server, FileText, Globe, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'file' | 'url' | 'dashboard' | 'yara';
  setActiveTab: (tab: 'file' | 'url' | 'dashboard' | 'yara') => void;
  backendOnline: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  backendOnline,
  onRefreshHealth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'file' | 'url' | 'dashboard' | 'yara') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    }}>
      {/* Top Telemetry Ticker Bar */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.4)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.25rem 1rem',
        fontSize: '0.725rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--status-safe)',
          }} />
          <span style={{ color: 'var(--primary-accent)', fontWeight: 800 }}>ANTIVIRUS AKN SECURITY ENGINE</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: 'var(--text-main)' }}>YARA Ruleset v4.5 • VirusTotal Intelligence • Shannon Entropy Metrics</span>
        </div>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
          <span>LATENCY: <strong style={{ color: 'var(--status-safe)' }}>12ms</strong></span>
          <span>REAL-TIME ENGINE: <strong style={{ color: 'var(--primary-accent)' }}>ONLINE</strong></span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        {/* Brand Logo & Shield */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <div style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(59, 130, 246, 0.3)',
            flexShrink: 0,
          }}>
            <ShieldCheck size={20} color="#FFF" />
          </div>

          <div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}>
              <span className="hide-on-mobile">ANTIVIRUS </span><span className="text-accent">AKN</span>
            </h1>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 6,
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary-accent)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                fontFamily: 'var(--font-mono)',
              }}>
                v2.0 ENTERPRISE
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>•</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Security Inspection Console</span>
            </div>
          </div>
        </div>

        {/* Desktop Mode Switcher Tabs */}
        <nav className="hide-on-mobile" style={{
          display: 'flex',
          background: 'rgba(17, 24, 39, 0.9)',
          padding: '0.3rem',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => handleTabClick('file')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'file' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'file' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'file' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <FileText size={16} color={activeTab === 'file' ? '#FFF' : 'var(--text-muted)'} /> File Scanner
          </button>

          <button
            onClick={() => handleTabClick('url')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'url' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'url' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'url' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Globe size={16} color={activeTab === 'url' ? '#FFF' : 'var(--text-muted)'} /> Link & URL Scanner
          </button>

          <button
            onClick={() => handleTabClick('dashboard')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'dashboard' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'dashboard' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <LayoutDashboard size={16} color={activeTab === 'dashboard' ? '#FFF' : 'var(--text-muted)'} /> Security Dashboard
          </button>

          <button
            onClick={() => handleTabClick('yara')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'yara' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'yara' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'yara' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Sparkles size={16} color={activeTab === 'yara' ? '#FFF' : 'var(--text-muted)'} /> YARA Studio
          </button>
        </nav>

        {/* Live Server Connection Status & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Status Badge visible on Desktop */}
          <div
            className="hide-on-mobile"
            title={backendOnline ? 'FastAPI Engine Online' : 'Local Inspection Engine Active'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 20,
              background: backendOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
              fontSize: '0.725rem',
              fontWeight: 800,
              color: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
              flexShrink: 0,
            }}
          >
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
              flexShrink: 0,
            }} />
            <Server size={14} style={{ flexShrink: 0 }} />
            <span>{backendOnline ? 'FastAPI Connected' : 'Engine Active'}</span>
          </div>

          <button
            onClick={onRefreshHealth}
            title="Refresh Health Probe"
            style={{
              background: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.5rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <RefreshCw size={15} />
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            className="show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--primary-accent)',
              padding: '0.5rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          className="show-on-mobile"
          style={{
            background: 'rgba(17, 24, 39, 0.98)',
            borderTop: '1px solid var(--border-color)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            borderRadius: 10,
            background: backendOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
            fontSize: '0.8rem',
            fontWeight: 800,
            color: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
            marginBottom: '0.35rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
              }} />
              <Server size={16} />
              <span>Engine Status</span>
            </div>
            <span>{backendOnline ? 'FastAPI Connected' : 'Engine Active'}</span>
          </div>

          <button
            onClick={() => handleTabClick('file')}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'file' ? 'var(--primary-accent)' : 'rgba(31, 41, 55, 0.6)',
              color: activeTab === 'file' ? '#FFF' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <FileText size={18} color={activeTab === 'file' ? '#FFF' : 'var(--primary-accent)'} /> File & APK Scanner
          </button>

          <button
            onClick={() => handleTabClick('url')}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'url' ? 'var(--primary-accent)' : 'rgba(31, 41, 55, 0.6)',
              color: activeTab === 'url' ? '#FFF' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Globe size={18} color={activeTab === 'url' ? '#FFF' : 'var(--primary-accent)'} /> Link & URL Inspector
          </button>

          <button
            onClick={() => handleTabClick('dashboard')}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'dashboard' ? 'var(--primary-accent)' : 'rgba(31, 41, 55, 0.6)',
              color: activeTab === 'dashboard' ? '#FFF' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#FFF' : 'var(--primary-accent)'} /> Security Dashboard
          </button>

          <button
            onClick={() => handleTabClick('yara')}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'yara' ? 'var(--primary-accent)' : 'rgba(31, 41, 55, 0.6)',
              color: activeTab === 'yara' ? '#FFF' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Sparkles size={18} color={activeTab === 'yara' ? '#FFF' : 'var(--primary-accent)'} /> YARA Studio
          </button>
        </nav>
      )}
    </header>
  );
};




