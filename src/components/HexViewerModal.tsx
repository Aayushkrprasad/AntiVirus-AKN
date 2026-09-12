import React, { useState } from 'react';
import { X, Search, FileCode, Copy, Check } from 'lucide-react';

interface HexViewerModalProps {
  filename: string;
  onClose: () => void;
}

export const HexViewerModal: React.FC<HexViewerModalProps> = ({ filename, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Sample binary byte stream representation (DOS MZ Executable Header)
  const hexRows = [
    { offset: '00000000', hex: '4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00', ascii: 'MZ..............' },
    { offset: '00000010', hex: 'B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00', ascii: '........@.......' },
    { offset: '00000020', hex: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { offset: '00000030', hex: '00 00 00 00 00 00 00 00 00 00 00 00 80 00 00 00', ascii: '................' },
    { offset: '00000040', hex: '0E 1F 8B 0E 0C 01 8B F1 4B 8B FE 4B 8B CB AD AD', ascii: '........K..K....' },
    { offset: '00000050', hex: '54 68 69 73 20 70 72 6F 67 72 61 6D 20 63 61 6E', ascii: 'This program can' },
    { offset: '00000060', hex: '6E 6F 74 20 62 65 20 72 75 6E 20 69 6E 20 44 4F', ascii: 'not be run in DO' },
    { offset: '00000070', hex: '53 20 6D 6F 64 65 2E 0D 0D 0A 24 00 00 00 00 00', ascii: 'S mode....$.....' },
    { offset: '00000080', hex: '50 45 00 00 4C 01 03 00 E1 59 BD 66 00 00 00 00', ascii: 'PE..L....Y.f....' },
    { offset: '00000090', hex: '00 00 00 00 E0 00 02 01 0B 01 02 19 00 10 00 00', ascii: '................' },
  ];

  const handleCopyHex = () => {
    const raw = hexRows.map(r => `${r.offset}  ${r.hex}  |${r.ascii}|`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.5rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 860,
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 24,
        position: 'relative',
        border: '1px solid var(--border-glow)',
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(11, 17, 32, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
              <FileCode size={22} color="var(--primary-neon)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Binary Hex Editor & Opcode Inspector</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Target Payload: {filename}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleCopyHex}
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: 'var(--primary-neon)',
                padding: '0.45rem 0.85rem',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Raw Hex'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.75rem',
          background: 'rgba(6, 9, 19, 0.6)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(11, 17, 32, 0.8)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 8, width: 300 }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search byte string or hex offset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.8rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--status-safe)' }}>● Executable Header (MZ)</span>
            <span style={{ color: 'var(--status-warning)' }}>● High Entropy Section</span>
          </div>
        </div>

        {/* Main Hex Viewer Table Body */}
        <div style={{
          flex: 1,
          padding: '1.5rem 1.75rem',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          background: '#040711',
          lineHeight: 1.6,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 180px', gap: '1.5rem', fontWeight: 700, color: 'var(--text-dim)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
            <span>OFFSET</span>
            <span>HEXADECIMAL BYTE STREAM (16-BYTES)</span>
            <span>ASCII DECODED</span>
          </div>

          {hexRows.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 180px',
                gap: '1.5rem',
                padding: '0.3rem 0',
                borderBottom: '1px solid rgba(30, 41, 59, 0.4)',
                background: idx === 0 ? 'rgba(16, 185, 129, 0.08)' : idx >= 5 && idx <= 7 ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              }}
            >
              <span style={{ color: 'var(--primary-neon)' }}>{row.offset}</span>
              <span style={{ color: 'var(--text-main)', letterSpacing: '0.05em' }}>{row.hex}</span>
              <span style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>{row.ascii}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
