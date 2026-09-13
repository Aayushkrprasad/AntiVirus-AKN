import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Server, FileText, Globe, LayoutDashboard, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'file' | 'url' | 'dashboard';
  setActiveTab: (tab: 'file' | 'url' | 'dashboard') => void;
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

  const handleTabClick = (tab: 'file' | 'url' | 'dashboard') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.5rem',
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        {/* Brand Logo & Cyber Shield */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
            flexShrink: 0,
          }}>
            <ShieldCheck size={24} color="#000" />
          </div>

          <div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              lineHeight: 1.1,
            }}>
              ANTIVIRUS <span className="text-neon">AKN</span>
            </h1>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: 6,
                background: 'rgba(0, 240, 255, 0.1)',
                color: 'var(--primary-neon)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                fontFamily: 'var(--font-mono)',
              }}>
                v2.0 ENTERPRISE
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>•</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Multi-Engine Inspection</span>
            </div>
          </div>
        </div>

        {/* Desktop Mode Switcher Tabs */}
        <nav className="hide-on-mobile" style={{
          display: 'flex',
          background: 'rgba(11, 17, 32, 0.9)',
          padding: '0.3rem',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
        }}>
          <button
            onClick={() => handleTabClick('file')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 9,
              border: 'none',
              background: activeTab === 'file' ? 'var(--primary-neon)' : 'transparent',
              color: activeTab === 'file' ? '#000' : 'var(--text-muted)',
              fontWeight: activeTab === 'file' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'file' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            <FileText size={15} color={activeTab === 'file' ? '#000' : 'var(--text-muted)'} /> File Scanner
          </button>

          <button
            onClick={() => handleTabClick('url')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 9,
              border: 'none',
              background: activeTab === 'url' ? 'var(--primary-neon)' : 'transparent',
              color: activeTab === 'url' ? '#000' : 'var(--text-muted)',
              fontWeight: activeTab === 'url' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'url' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            <Globe size={15} color={activeTab === 'url' ? '#000' : 'var(--text-muted)'} /> Link & URL Scanner
          </button>

          <button
            onClick={() => handleTabClick('dashboard')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 9,
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--primary-neon)' : 'transparent',
              color: activeTab === 'dashboard' ? '#000' : 'var(--text-muted)',
              fontWeight: activeTab === 'dashboard' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'dashboard' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            <LayoutDashboard size={15} color={activeTab === 'dashboard' ? '#000' : 'var(--text-muted)'} /> Security Dashboard
          </button>
        </nav>

        {/* Live Server Connection Status & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            background: backendOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
            fontSize: '0.725rem',
            fontWeight: 700,
            color: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
              boxShadow: `0 0 8px ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
            }} />
            <Server size={13} />
            <span>{backendOnline ? 'FastAPI Connected' : 'Engine Active'}</span>
          </div>

          <button
            onClick={onRefreshHealth}
            title="Refresh Backend API Probe"
            style={{
              background: 'rgba(11, 17, 32, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.45rem',
              borderRadius: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={14} />
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            className="show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: 'var(--primary-neon)',
              padding: '0.45rem',
              borderRadius: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '0.25rem',
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
            background: 'rgba(11, 17, 32, 0.98)',
            borderTop: '1px solid var(--border-color)',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
          }}
        >
          <button
            onClick={() => handleTabClick('file')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'file' ? 'var(--primary-neon)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'file' ? '#000' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <FileText size={18} color={activeTab === 'file' ? '#000' : 'var(--primary-neon)'} /> File & APK Scanner
          </button>

          <button
            onClick={() => handleTabClick('url')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'url' ? 'var(--primary-neon)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'url' ? '#000' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Globe size={18} color={activeTab === 'url' ? '#000' : 'var(--primary-neon)'} /> Link & URL Inspector
          </button>

          <button
            onClick={() => handleTabClick('dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: activeTab === 'dashboard' ? 'var(--primary-neon)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'dashboard' ? '#000' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#000' : 'var(--primary-neon)'} /> Security Dashboard
          </button>
        </nav>
      )}
    </header>
  );
};

