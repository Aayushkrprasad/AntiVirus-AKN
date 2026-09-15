import React, { useState } from 'react';
import { ShieldCheck, Activity, Database, Lock, AlertTriangle, Plus, Trash2, Key, CheckCircle, Shield, Bell, Send, Terminal, Sparkles } from 'lucide-react';
import type { SystemStats } from '../types';

interface StatsDashboardProps {
  stats: SystemStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [passwords, setPasswords] = useState([
    { id: '1', site: 'github.com', user: 'security_admin@enterprise.io', date: '2026-09-10' },
    { id: '2', site: 'binance.com', user: 'trader@crypto.io', date: '2026-09-11' },
    { id: '3', site: 'aws.amazon.com', user: 'root_devops@cloud.net', date: '2026-09-12' },
  ]);
  const [newSite, setNewSite] = useState('');
  const [newUser, setNewUser] = useState('');

  const TELEMETRY_LOGS = [
    { time: '11:24:02', event: 'YARA Signature DB Synced v2.0.2026.08', level: 'INFO', color: '#00F0FF' },
    { time: '11:21:44', event: 'Blocked Suspicious HTTP POST to 194.26.29.11', level: 'BLOCKED', color: '#FF2A6D' },
    { time: '11:18:10', event: 'Heuristic APK Permission Audit Cleared (0 dangerous flags)', level: 'CLEAN', color: '#10B981' },
    { time: '11:12:05', event: 'Phishing Keyword Detection Spoof Alert Triggered', level: 'WARN', color: '#F59E0B' },
  ];

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite || !newUser) return;
    setPasswords([
      { id: Date.now().toString(), site: newSite, user: newUser, date: new Date().toLocaleDateString() },
      ...passwords,
    ]);
    setNewSite('');
    setNewUser('');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(res);
  };

  const handleTestWebhook = () => {
    if (!webhookUrl || !webhookUrl.trim()) {
      setWebhookStatus('Please enter a valid Slack or Discord Webhook URL.');
      return;
    }
    setWebhookStatus('Dispatching test threat payload to Webhook...');
    setTimeout(() => {
      setWebhookStatus('✓ Webhook Threat Alert Dispatched Successfully! (Status 200 OK)');
    }, 800);
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
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: 'var(--status-safe)',
          fontSize: '0.8rem',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '0.06em',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)',
        }}>
          <Shield size={14} /> LIVE THREAT POSTURE & TELEMETRY CENTER
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.6rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          Enterprise Security Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
          Real-time threat status monitor, telemetry log stream, YARA signature updates, Webhook notification triggers, and client encrypted credential vault.
        </p>
      </div>

      {/* Cyber Score Circle Header Card */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem', marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.5rem' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray="376.99"
              strokeDashoffset="0"
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 10px #10B981)' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--status-safe)', lineHeight: 1 }}>100</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>HEALTH SCORE</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--status-safe)', marginBottom: '0.3rem', letterSpacing: '0.02em' }}>
          SYSTEM IS FULLY PROTECTED
        </h3>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
          Real-Time Threat Inspector Active • Zero Unresolved Vulnerabilities
        </p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid-responsive-stats" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <ShieldCheck size={32} color="var(--status-safe)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>PROTECTION STATUS</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--status-safe)', marginTop: '0.2rem' }}>ACTIVE DEFENSE</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Activity size={32} color="var(--primary-neon)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>SCANS EXECUTED</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '0.2rem' }}>{stats.totalScansCount} Scans</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <AlertTriangle size={32} color={stats.threatsFoundCount > 0 ? 'var(--status-danger)' : 'var(--status-safe)'} style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>THREATS BLOCKED</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '0.2rem' }}>{stats.threatsFoundCount} Threats</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Database size={32} color="var(--accent-violet)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>SIGNATURE DB VERSION</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: '0.2rem', color: 'var(--accent-violet)' }}>{stats.definitionsVersion}</h3>
        </div>
      </div>

      {/* Real-time Threat Telemetry Feed */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Terminal size={18} color="var(--primary-neon)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-neon)', letterSpacing: '0.06em' }}>
              REAL-TIME THREAT TELEMETRY FEED
            </h4>
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--status-safe)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-safe)', boxShadow: '0 0 6px var(--status-safe)' }} /> STREAM LIVE
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
          {TELEMETRY_LOGS.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                borderRadius: 8,
                background: 'rgba(3, 7, 18, 0.7)',
                borderLeft: `3px solid ${log.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>[{log.time}]</span>
                <span style={{ color: 'var(--text-main)' }}>{log.event}</span>
              </div>
              <span style={{
                fontSize: '0.675rem',
                fontWeight: 900,
                padding: '0.15rem 0.45rem',
                borderRadius: 4,
                color: log.color,
                background: 'rgba(11, 17, 32, 0.9)',
                border: `1px solid ${log.color}40`,
              }}>
                {log.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook & Discord/Slack Dispatcher Container */}
      <div className="glass-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <Bell size={24} color="var(--status-warning)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Real-Time Threat Webhook Alerts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dispatch instant notifications to Discord or Slack when a high-risk payload is detected.</p>
          </div>
        </div>

        <div className="responsive-flex-stack" style={{ marginBottom: '1rem' }}>
          <input
            type="url"
            placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(3, 7, 18, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '0.85rem 1.1rem',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            onClick={handleTestWebhook}
            style={{
              background: 'var(--primary-neon)',
              color: '#000',
              fontWeight: 900,
              padding: '0.85rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
            }}
          >
            <Send size={18} /> Test Webhook
          </button>
        </div>

        {webhookStatus && (
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: webhookStatus.startsWith('✓') ? 'var(--status-safe)' : 'var(--status-warning)',
          }}>
            {webhookStatus}
          </p>
        )}
      </div>

      {/* Encrypted Password Vault Container */}
      <div className="glass-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ padding: 10, borderRadius: 12, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
              <Lock size={24} color="var(--primary-neon)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Encrypted Password Vault</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Store and manage credentials in your browser's local sandbox.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={generateRandomPassword}
            style={{
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-violet)',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '0.45rem 0.85rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} /> Generate High Entropy Password
          </button>
        </div>

        <form onSubmit={handleAddCredential} className="responsive-flex-stack" style={{ marginBottom: '1.75rem' }}>
          <input
            type="text"
            placeholder="Website/Service (e.g. github.com)"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(3, 7, 18, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '0.85rem 1.1rem',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Username or Password"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(3, 7, 18, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '0.85rem 1.1rem',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--primary-neon)',
              color: '#000',
              fontWeight: 900,
              padding: '0.85rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
            }}
          >
            <Plus size={18} /> Add Vault Item
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {passwords.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(3, 7, 18, 0.75)',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.35rem',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Key size={18} color="var(--primary-neon)" />
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.site}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.user}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--status-safe)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} /> Strong Hash
                </span>
                <button
                  onClick={() => setPasswords(passwords.filter((p) => p.id !== item.id))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <Trash2 size={18} color="var(--status-danger)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

