import React from 'react';
import { ShieldCheck, RefreshCw, Server, FileText, Globe, LayoutDashboard, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'file' | 'url' | 'yara' | 'dashboard';
  setActiveTab: (tab: 'file' | 'url' | 'yara' | 'dashboard') => void;
  backendOnline: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  backendOnline,
  onRefreshHealth,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2.5rem',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    }}>
      {/* Brand Logo & Cyber Shield */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          position: 'relative',
          width: 46,
          height: 46,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
        }}>
          <ShieldCheck size={28} color="#000" />
        </div>

        <div>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ANTIVIRUS <span className="text-neon">AKN</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: 6,
              background: 'rgba(0, 240, 255, 0.1)',
              color: 'var(--primary-neon)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}>
              ENTERPRISE EDITION v2.0
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Engine Threat Intelligence</span>
          </div>
        </div>
      </div>

      {/* Futuristic Mode Switcher Tabs */}
      <nav style={{
        display: 'flex',
        background: 'rgba(11, 17, 32, 0.9)',
        padding: '0.35rem',
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
      }}>
        <button
          onClick={() => setActiveTab('file')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'file' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'file' ? '#000' : 'var(--text-muted)',
            fontWeight: activeTab === 'file' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'file' ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
          }}
        >
          <FileText size={16} color={activeTab === 'file' ? '#000' : 'var(--text-muted)'} /> File Scanner
        </button>

        <button
          onClick={() => setActiveTab('url')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'url' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'url' ? '#000' : 'var(--text-muted)',
            fontWeight: activeTab === 'url' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'url' ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
          }}
        >
          <Globe size={16} color={activeTab === 'url' ? '#000' : 'var(--text-muted)'} /> Link & URL Scanner
        </button>

        <button
          onClick={() => setActiveTab('yara')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'yara' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'yara' ? '#000' : 'var(--text-muted)',
            fontWeight: activeTab === 'yara' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'yara' ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
          }}
        >
          <Sparkles size={16} color={activeTab === 'yara' ? '#000' : 'var(--text-muted)'} /> YARA Studio
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'dashboard' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'dashboard' ? '#000' : 'var(--text-muted)',
            fontWeight: activeTab === 'dashboard' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'dashboard' ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
          }}
        >
          <LayoutDashboard size={16} color={activeTab === 'dashboard' ? '#000' : 'var(--text-muted)'} /> Security Dashboard
        </button>
      </nav>

      {/* Live Server Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 0.95rem',
          borderRadius: 24,
          background: backendOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: backendOnline ? 'var(--status-safe)' : 'var(--status-warning)',
            boxShadow: `0 0 10px ${backendOnline ? 'var(--status-safe)' : 'var(--status-warning)'}`,
          }} />
          <Server size={14} />
          {backendOnline ? 'FastAPI Connected' : 'Client Engine Active'}
        </div>

        <button
          onClick={onRefreshHealth}
          title="Refresh Backend API Probe"
          style={{
            background: 'rgba(11, 17, 32, 0.8)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '0.5rem',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
};
