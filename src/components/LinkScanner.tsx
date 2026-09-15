import React, { useState } from 'react';
import { Globe, ShieldAlert, AlertTriangle, Lock, ArrowRight, Zap, RefreshCw, Link as LinkIcon, Clipboard, Play } from 'lucide-react';
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
      // Permission denied fallback
    }
  };

  const handleScan = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || urlInput).trim();
    if (!finalUrl) {
      setErrorMsg('Please enter or paste a valid link/URL to scan.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);

    const result = await scanUrl(finalUrl);

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
          padding: '0.45rem 1.15rem',
          borderRadius: 20,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: 'var(--primary-accent)',
          fontSize: '0.8rem',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          <Globe size={14} /> DOMAIN & LINK REPUTATION ENGINE
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          Paste Any Customized Link to Scan
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
          Inspect custom links, shortened URLs, and domain names for phishing attempts, brand spoofing keywords, high-risk top-level domains, and SSL certificate compliance.
        </p>
      </div>

      {/* Enterprise Command URL Input Box */}
      <div className="glass-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <label style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--primary-accent)',
            letterSpacing: '0.06em',
          }}>
            PASTE CUSTOMIZED LINK / TARGET URL
          </label>

          <button
            onClick={handlePaste}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--primary-accent)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.75rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Clipboard size={13} /> Paste from Clipboard
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10, 14, 23, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.7)',
          transition: 'all 0.25s ease',
        }}>
          <LinkIcon size={22} color="var(--primary-accent)" style={{ marginRight: '0.85rem', flexShrink: 0 }} />
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
          onClick={() => handleScan()}
          disabled={isScanning}
          style={{
            width: '100%',
            background: isScanning ? 'var(--border-color)' : 'var(--primary-accent)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1rem',
            padding: '0.95rem',
            borderRadius: 12,
            border: 'none',
            cursor: isScanning ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.25s ease',
          }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={20} className="pulse-radar" /> Analyzing Link Protocol & Domain Reputation...
            </>
          ) : (
            <>
              <Zap size={20} /> SCAN CUSTOMIZED LINK NOW <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* Preset Demo Links */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-accent)', letterSpacing: '0.06em', marginBottom: '1rem' }}>
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
                handleScan(sample.url);
              }}
              style={{
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                borderRadius: 14,
                transition: 'all 0.25s ease',
                border: '1px solid var(--border-color)',
                background: 'rgba(17, 24, 39, 0.85)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>{sample.label}</p>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 6,
                  backgroundColor: 'rgba(10, 14, 23, 0.9)',
                  color: sample.color,
                  border: `1px solid ${sample.color}`,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {sample.type}
                </span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.5rem' }}>
                {sample.url}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                <Play size={11} fill="var(--text-muted)" /> Instant Test
              </div>
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
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
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
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Lock size={22} color="var(--primary-accent)" />
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


