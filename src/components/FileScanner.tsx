import React, { useState, useRef } from 'react';
import { UploadCloud, File, ShieldCheck, FileCode, Zap, Cpu, Terminal, Play, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
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
    { label: 'Android Package', ext: '.apk', color: '#10B981' },
    { label: 'Windows Executable', ext: '.exe / .dll', color: '#EF4444' },
    { label: 'Compressed Archive', ext: '.zip / .tar.gz', color: '#F59E0B' },
    { label: 'Document & PDF', ext: '.pdf / .docx', color: '#3B82F6' },
    { label: 'Script & Payload', ext: '.js / .vbs / .py', color: '#6366F1' },
  ];

  const DEMO_SAMPLES = [
    { name: 'sample_document_clean.pdf', size: '1.2 MB', type: 'Clean Document', icon: CheckCircle, color: '#10B981', mime: 'application/pdf' },
    { name: 'bank_auth_trojan_v2.apk', size: '14.8 MB', type: 'Malicious APK', icon: ShieldAlert, color: '#EF4444', mime: 'application/vnd.android.package-archive' },
    { name: 'eicar_test_signature.exe', size: '68 KB', type: 'EICAR Test Pattern', icon: AlertTriangle, color: '#F59E0B', mime: 'application/x-dsexec' },
    { name: 'crypto_stealer_hook.js', size: '42 KB', type: 'Suspicious Script', icon: Zap, color: '#6366F1', mime: 'text/javascript' },
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

  const handleDemoScan = (sample: typeof DEMO_SAMPLES[0]) => {
    const dummyBlob = new Blob(['FAKE_PAYLOAD_BYTE_STREAM'], { type: sample.mime });
    const dummyFile = new (File as any)([dummyBlob], sample.name, { type: sample.mime });
    handleFileDrop(dummyFile);
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
          <Terminal size={14} /> HEURISTIC BYTECODE & YARA INSPECTION ENGINE
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          Upload & Analyze Any Payload File
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
          Drag and drop any binary, document, executable, or Android APK. Executes YARA pattern matching, SHA-256 reputation checks, and Shannon entropy analysis.
        </p>
      </div>

      {/* Enterprise Scanner Dropzone */}
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
          padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          border: isDragging ? '2px dashed var(--primary-accent)' : '2px dashed var(--border-color)',
          background: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-glass)',
          borderRadius: 20,
          transition: 'all 0.25s ease',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDragging ? '0 0 40px rgba(59, 130, 246, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
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
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px solid var(--primary-accent)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={44} color="var(--primary-accent)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Analyzing Target: <span style={{ color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>{currentFileName}</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', fontFamily: 'var(--font-mono)' }}>
              {scanStep}
            </p>

            {/* Progress Bar */}
            <div style={{
              width: '85%',
              maxWidth: 480,
              height: 8,
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: 6,
              margin: '0 auto',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
                borderRadius: 6,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UploadCloud size={44} color="var(--primary-accent)" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Drag & Drop your file here to scan
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Supports APK, EXE, DLL, ZIP, TAR, PDF, JS, BIN, and all binary payloads (Max 50MB)
            </p>

            <button
              style={{
                background: 'var(--primary-accent)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.85rem 2.25rem',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <File size={19} /> Choose Payload File
            </button>
          </div>
        )}
      </div>

      {/* One-Click Quick Test Demo Samples */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-accent)', letterSpacing: '0.06em' }}>
            ONE-CLICK INSTANT DEMO PAYLOAD SAMPLES
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>No real malware executed</span>
        </div>

        <div className="grid-responsive-cards">
          {DEMO_SAMPLES.map((sample, idx) => {
            const IconComponent = sample.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDemoScan(sample);
                }}
                style={{
                  padding: '1.15rem 1.25rem',
                  cursor: 'pointer',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(17, 24, 39, 0.85)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <IconComponent size={18} color={sample.color} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sample.color, fontFamily: 'var(--font-mono)' }}>
                      {sample.type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{sample.size}</span>
                </div>

                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sample.name}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--primary-accent)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.1)',
                  width: 'fit-content',
                }}>
                  <Play size={12} fill="var(--primary-accent)" /> Run Instant Inspection
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Format Grid Tags */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '1rem', textAlign: 'center' }}>
          SUPPORTED PAYLOAD FORMATS
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {SUPPORTED_FORMATS.map((fmt, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.5rem 1.1rem',
                borderRadius: 10,
                background: 'rgba(17, 24, 39, 0.85)',
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
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <FileCode size={22} color="var(--primary-accent)" />
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


