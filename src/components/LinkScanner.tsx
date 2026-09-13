import React, { useState } from 'react';
import { Globe, ShieldAlert, AlertTriangle, Lock, ArrowRight, Zap, RefreshCw, Link as LinkIcon, Clipboard } from 'lucide-react';
import type { ScanResult } from '../types';
import { scanUrl } from '../api';

interface LinkScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export const LinkScanner: React.FC<LinkScannerProps> = ({ onScanComplete }) => {
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const SAMPLE_LINKS = [
    { label: 'Clean GitHub Repo', url: 'https://github.com/facebook/react-native', type: 'SAFE', color: 'var(--status-safe)' },
    { label: 'Phishing Keyword Spoof', url: 'https://paypal-verify-account-security.net/login', type: 'DANGER', color: 'var(--status-danger)' },
    { label: 'High-Risk TLD (.xyz)', url: 'https://free-crypto-airdrop.xyz/claim', type: 'WARNING', color: 'var(--status-warning)' },
    { label: 'Unencrypted HTTP', url: 'http://my-unsecured-portal.com/auth', type: 'WARNING', color: 'var(--status-warning)' },
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        if (errorMsg) setErrorMsg('');
      }
    } catch {
      // Permission denied
    }
  };

  const handleScan = async () => {
    if (!urlInput || !urlInput.trim()) {
      setErrorMsg('Please enter or paste a valid link/URL to scan.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);

    const result = await scanUrl(urlInput.trim());

    setTimeout(() => {
      setIsScanning(false);
      onScanComplete(result);
    }, 700);
  };

  return (
    <div className="page-container">
      {/* Top Banner Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 20,
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          color: 'var(--primary-neon)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          <Globe size={14} /> DOMAIN & LINK REPUTATION ENGINE
        </div>

        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          Paste Any Customized Link to Scan
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
          Inspect custom links, shortened URLs, and domain names for phishing attempts, brand spoofing keywords, high-risk top-level domains, and SSL certificate compliance.
        </p>
      </div>

      {/* Futuristic Command URL Input Box */}
      <div className="glass-card" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)', marginBottom: '2.5rem', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <label style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--primary-neon)',
            letterSpacing: '0.08em',
          }}>
            PASTE CUSTOMIZED LINK / TARGET URL
          </label>

          <button
            onClick={handlePaste}
            style={{
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: 'var(--primary-neon)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clipboard size={12} /> Paste from Clipboard
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(3, 7, 18, 0.9)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '0.6rem 1.2rem',
          marginBottom: '1.25rem',
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)',
          transition: 'all 0.25s ease',
        }}>
          <LinkIcon size={22} color="var(--primary-neon)" style={{ marginRight: '0.85rem', flexShrink: 0 }} />
          <input
            type="url"
            placeholder="https://example.com/customized-link..."
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleScan();
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
            }}
          />
          {urlInput && (
            <button
              onClick={() => setUrlInput('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 0.5rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--status-danger)', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </p>
        )}

        <button
          onClick={handleScan}
          disabled={isScanning}
          style={{
            width: '100%',
            background: isScanning ? 'var(--border-color)' : 'linear-gradient(135deg, #00F0FF 0%, #3B82F6 100%)',
            color: '#000',
            fontWeight: 900,
            fontSize: '1rem',
            padding: '1rem',
            borderRadius: 12,
            border: 'none',
            cursor: isScanning ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.35)',
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
          }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={22} className="pulse-radar" /> Analyzing Link Protocol & Domain...
            </>
          ) : (
            <>
              <Zap size={22} /> SCAN CUSTOMIZED LINK NOW <ArrowRight size={22} />
            </>
          )}
        </button>
      </div>

      {/* Preset Demo Links */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          CLICK SAMPLE LINK FOR INSTANT THREAT SCAN
        </h4>

        <div className="grid-responsive-cards">
          {SAMPLE_LINKS.map((sample, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => {
                setUrlInput(sample.url);
                setErrorMsg('');
              }}
              style={{
                padding: '1rem 1.15rem',
                cursor: 'pointer',
                borderRadius: 14,
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sample.label}</p>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: 6,
                  backgroundColor: 'rgba(6, 9, 19, 0.8)',
                  color: sample.color,
                  border: `1px solid ${sample.color}`,
                }}>
                  {sample.type}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sample.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Checks Grid */}
      <div className="grid-responsive-cards">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <ShieldAlert size={22} color="var(--status-warning)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Phishing Spoof Guard</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Flags brand spoofing and credential harvesting keywords (`login`, `bank`, `paypal`, `crypto`) on unofficial domains.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(255, 42, 109, 0.1)', border: '1px solid rgba(255, 42, 109, 0.2)' }}>
              <AlertTriangle size={22} color="var(--status-danger)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>High-Risk TLD Classifier</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Detects top-level domains (`.xyz`, `.top`, `.zip`, `.click`, `.link`) statistically linked with spam & phishing campaigns.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              <Lock size={22} color="var(--primary-neon)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>SSL & Protocol Check</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Enforces HTTPS transmission safety & warns against plain-text unencrypted `http://` connections.
          </p>
        </div>
      </div>
    </div>
  );
};
