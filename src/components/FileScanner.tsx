import React, { useState, useRef } from 'react';
import { UploadCloud, File, ShieldCheck, FileCode, Zap, Cpu, Terminal } from 'lucide-react';
import type { ScanResult } from '../types';
import { scanFile } from '../api';

interface FileScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export const FileScanner: React.FC<FileScannerProps> = ({ onScanComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUPPORTED_FORMATS = [
    { label: 'Android APK', ext: '.apk', color: '#10B981' },
    { label: 'Executable Binary', ext: '.exe / .dll', color: '#EF4444' },
    { label: 'Compressed Archive', ext: '.zip / .tar', color: '#F59E0B' },
    { label: 'Documents', ext: '.pdf / .doc', color: '#3B82F6' },
    { label: 'Scripts & Web', ext: '.js / .vbs / .sh', color: '#8B5CF6' },
  ];

  const handleFileDrop = async (file: File) => {
    if (!file) return;
    setCurrentFileName(file.name);
    setIsScanning(true);
    setProgressPercent(15);
    setScanStep('Hashing payload (MD5, SHA-1 & SHA-256 digests)...');

    setTimeout(() => {
      setProgressPercent(45);
      setScanStep('Compiling YARA Static Rules & Calculating Shannon Entropy...');
    }, 400);

    setTimeout(() => {
      setProgressPercent(80);
      setScanStep('Inspecting MIME headers & Android Manifest permissions...');
    }, 750);

    const result = await scanFile(file);

    setTimeout(() => {
      setProgressPercent(100);
      setIsScanning(false);
      onScanComplete(result);
    }, 1000);
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
          <Terminal size={14} /> HEURISTIC BYTECODE INSPECTION ENGINE
        </div>

        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          Upload & Inspect Any Payload File
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
          Drag and drop any binary, document, executable, or Android APK. Performs YARA pattern matching, SHA-256 reputation checks, and Shannon entropy analysis.
        </p>
      </div>

      {/* Cyberpunk Scanner Dropzone */}
      <div
        className="glass-card"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileDrop(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: 'clamp(2rem, 6vw, 4rem) 1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          border: isDragging ? '2px dashed var(--primary-neon)' : '2px dashed rgba(30, 41, 59, 0.9)',
          background: isDragging ? 'rgba(0, 240, 255, 0.06)' : 'var(--bg-glass)',
          borderRadius: 24,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDragging ? '0 0 40px rgba(0, 240, 255, 0.25)' : '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Laser beam animation when active scanning */}
        {isScanning && <div className="laser-beam" />}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileDrop(e.target.files[0]);
            }
          }}
        />

        {isScanning ? (
          <div style={{ padding: '1rem 0' }}>
            <div
              className="pulse-radar"
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '2px solid var(--primary-neon)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
              }}
            >
              <Cpu size={42} color="var(--primary-neon)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Analyzing: <span style={{ color: 'var(--primary-neon)', fontFamily: 'var(--font-mono)' }}>{currentFileName}</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              {scanStep}
            </p>

            {/* Glowing Progress Bar */}
            <div style={{
              width: '85%',
              maxWidth: 460,
              height: 10,
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: 6,
              margin: '0 auto',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00F0FF 0%, #3B82F6 50%, #7000FF 100%)',
                borderRadius: 6,
                transition: 'width 0.3s ease',
                boxShadow: '0 0 12px #00F0FF',
              }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
            }}>
              <UploadCloud size={42} color="var(--primary-neon)" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Drag & Drop your file here to scan
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Supports APK, EXE, DLL, ZIP, TAR, PDF, JS, BIN, and all document types (Max 50MB)
            </p>

            <button
              style={{
                background: 'linear-gradient(135deg, #00F0FF 0%, #3B82F6 100%)',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.85rem 2.25rem',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 0 24px rgba(0, 240, 255, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <File size={19} /> Choose Payload File
            </button>
          </div>
        )}
      </div>

      {/* Format Grid Tags */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '1rem', textAlign: 'center' }}>
          SUPPORTED PAYLOAD FORMATS
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {SUPPORTED_FORMATS.map((fmt, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 12,
                background: 'rgba(11, 17, 32, 0.8)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: fmt.color }} />
              <span style={{ color: 'var(--text-main)' }}>{fmt.label}</span>
              <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{fmt.ext}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid-responsive-cards">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              <FileCode size={22} color="var(--primary-neon)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>YARA Pattern Engine</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Compiles multi-stage signature rules to flag trojans, ransomware payloads, and malicious webshell bytecodes.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Zap size={22} color="var(--status-warning)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Shannon Entropy Gauge</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Calculates byte distribution metrics to spot packed, encrypted, or heavily obfuscated malicious executables.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ShieldCheck size={22} color="var(--status-safe)" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>APK Manifest Inspection</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Extracts Android manifests via Androguard to classify permission combinations and certificate fingerprints.
          </p>
        </div>
      </div>
    </div>
  );
};
