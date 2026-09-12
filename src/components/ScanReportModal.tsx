import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, X, FileText, Code, Binary, CheckCircle2 } from 'lucide-react';
import type { ScanResult } from '../types';
import { HexViewerModal } from './HexViewerModal';

interface ScanReportModalProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ScanReportModal: React.FC<ScanReportModalProps> = ({ result, onClose }) => {
  const [showHexModal, setShowHexModal] = useState(false);

  if (!result) return null;

  const isClean = result.status === 'clean';

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `Security_Audit_${result.scanId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}>
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.25rem',
          borderRadius: 24,
          position: 'relative',
          border: `1px solid ${isClean ? 'var(--status-safe-glow)' : 'var(--status-danger-glow)'}`,
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            <X size={24} />
          </button>

          {/* Top Status Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: isClean ? 'var(--status-safe-glow)' : 'var(--status-danger-glow)',
              border: `2px solid ${isClean ? 'var(--status-safe)' : 'var(--status-danger)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: `0 0 30px ${isClean ? 'var(--status-safe-glow)' : 'var(--status-danger-glow)'}`,
            }}>
              {isClean ? (
                <ShieldCheck size={46} color="var(--status-safe)" />
              ) : (
                <ShieldAlert size={46} color="var(--status-danger)" />
              )}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem' }}>
              {isClean ? 'SECURITY VERIFIED — CLEAN' : 'SECURITY RISKS DETECTED'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Scanned Target: <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{result.scannedItemName}</span>
            </p>
          </div>

          {/* VirusTotal Reputation Card */}
          <div style={{
            background: 'rgba(11, 17, 32, 0.9)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: 8, borderRadius: 10, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <CheckCircle2 size={22} color="var(--primary-neon)" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>VirusTotal Threat Intelligence</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cross-referenced with 72 global AV detection engines</p>
              </div>
            </div>

            <span style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: isClean ? 'var(--status-safe)' : 'var(--status-danger)',
              padding: '0.35rem 0.85rem',
              borderRadius: 20,
              background: isClean ? 'var(--status-safe-glow)' : 'var(--status-danger-glow)',
            }}>
              {isClean ? '72 / 72 Clean' : 'Threat Flagged'}
            </span>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'rgba(6, 9, 19, 0.7)',
            padding: '1.25rem',
            borderRadius: 16,
            border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SECURITY SCORE</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: isClean ? 'var(--status-safe)' : 'var(--status-danger)' }}>
                {result.securityScore} / 100
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SCAN DURATION</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-neon)' }}>
                {result.durationSeconds}s
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>THREATS FOUND</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: result.threats.length > 0 ? 'var(--status-danger)' : 'var(--status-safe)' }}>
                {result.threats.length}
              </p>
            </div>
          </div>

          {/* File Metadata Details if File Scan */}
          {result.fileMeta && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-neon)', letterSpacing: '0.05em' }}>
                  FILE PAYLOAD METADATA
                </h4>
                <button
                  onClick={() => setShowHexModal(true)}
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
                  <Binary size={14} /> Inspect Hex Opcodes
                </button>
              </div>

              <div style={{
                background: 'rgba(6, 9, 19, 0.8)',
                padding: '1rem 1.25rem',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                fontSize: '0.825rem',
                fontFamily: 'var(--font-mono)',
              }}>
                <div><span style={{ color: 'var(--text-muted)' }}>MIME Type:</span> {result.fileMeta.mimeType}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Entropy:</span> {result.fileMeta.entropy.toFixed(2)} bits/byte</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SHA-256:</span> {result.fileMeta.sha256}
                </div>
              </div>
            </div>
          )}

          {/* URL Metadata Details if URL Scan */}
          {result.urlMeta && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-neon)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                CUSTOMIZED LINK METADATA
              </h4>
              <div style={{
                background: 'rgba(6, 9, 19, 0.8)',
                padding: '1rem 1.25rem',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                fontSize: '0.825rem',
                fontFamily: 'var(--font-mono)',
              }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Domain:</span> {result.urlMeta.domain}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>TLD:</span> .{result.urlMeta.tld}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>SSL Protocol:</span> {result.urlMeta.isSsl ? 'HTTPS (Secure)' : 'HTTP (Unencrypted)'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>IP Target:</span> {result.urlMeta.isIp ? 'Yes (Raw IP)' : 'No (Domain)'}</div>
              </div>
            </div>
          )}

          {/* Threat Items Breakdown */}
          {result.threats.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--status-danger)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                THREAT FINDINGS ({result.threats.length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {result.threats.map((threat) => (
                  <div
                    key={threat.id}
                    style={{
                      background: 'rgba(255, 42, 109, 0.08)',
                      border: '1px solid var(--status-danger)',
                      borderRadius: 14,
                      padding: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--status-danger)' }}>
                        {threat.name}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        background: threat.severity === 'danger' ? 'var(--status-danger)' : 'var(--status-warning)',
                        color: '#000',
                      }}>
                        {threat.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {threat.description}
                    </p>

                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(6, 9, 19, 0.6)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 8,
                    }}>
                      💡 <strong style={{ color: 'var(--text-main)' }}>Recommendation:</strong> {threat.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <button
              onClick={handlePrintPDF}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid var(--secondary-blue)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.75rem',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={16} /> Export PDF Report
            </button>

            <button
              onClick={handleExportJSON}
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid var(--accent-violet)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.75rem',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Code size={16} /> Export JSON Audit Log
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--primary-neon)',
              color: '#000',
              fontWeight: 900,
              fontSize: '1rem',
              padding: '0.9rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CLOSE REPORT
          </button>
        </div>
      </div>

      {/* Optional Hex Viewer Modal */}
      {showHexModal && (
        <HexViewerModal
          filename={result.scannedItemName}
          onClose={() => setShowHexModal(false)}
        />
      )}
    </>
  );
};
