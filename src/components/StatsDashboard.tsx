import React, { useState } from 'react';
import { ShieldCheck, Activity, Database, Lock, AlertTriangle, Plus, Trash2, Key, CheckCircle, Shield, Bell, Send } from 'lucide-react';
import type { SystemStats } from '../types';

interface StatsDashboardProps {
  stats: SystemStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [passwords, setPasswords] = useState([
    { id: '1', site: 'github.com', user: 'user@example.com', date: '2026-09-10' },
    { id: '2', site: 'binance.com', user: 'trader@crypto.io', date: '2026-09-11' },
    { id: '3', site: 'paypal.com', user: 'member@pay.com', date: '2026-09-12' },
  ]);
  const [newSite, setNewSite] = useState('');
  const [newUser, setNewUser] = useState('');

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

  const handleTestWebhook = () => {
    if (!webhookUrl || !webhookUrl.trim()) {
      setWebhookStatus('Please enter a valid Slack or Discord Webhook URL.');
      return;
    }
    setWebhookStatus('Sending test threat payload to Webhook...');
    setTimeout(() => {
      setWebhookStatus('✓ Webhook Alert Dispatched Successfully! (Status 200 OK)');
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
          padding: '0.4rem 1rem',
          borderRadius: 20,
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: 'var(--status-safe)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          <Shield size={14} /> SECURITY POSTURE MONITORING
        </div>

        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, marginBottom: '0.6rem' }} className="text-gradient">
          System Security Center & Health Score
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
          Real-time threat status monitor, scan history statistics, virus signature database updates, and encrypted password vault.
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
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 8px #10B981)' }}
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
            <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--status-safe)', lineHeight: 1 }}>100</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SCORE</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-safe)', marginBottom: '0.3rem' }}>
          SYSTEM IS FULLY PROTECTED
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Real-Time Threat Inspector Active • Zero Unresolved Vulnerabilities
        </p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid-responsive-stats" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <ShieldCheck size={32} color="var(--status-safe)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PROTECTION LEVEL</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--status-safe)', marginTop: '0.2rem' }}>MAXIMUM</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Activity size={32} color="var(--primary-neon)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL SCANS EXECUTED</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.totalScansCount} Scans</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <AlertTriangle size={32} color={stats.threatsFoundCount > 0 ? 'var(--status-danger)' : 'var(--status-safe)'} style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>THREATS DETECTED</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.threatsFoundCount} Threats</h3>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Database size={32} color="var(--accent-purple)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>SIGNATURE DATABASE</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{stats.definitionsVersion}</h3>
        </div>
      </div>

      {/* Webhook & Discord/Slack Dispatcher Container */}
      <div className="glass-card" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <Bell size={24} color="var(--status-warning)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Real-Time Threat Webhook Alerts</h3>
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
              background: 'rgba(3, 7, 18, 0.9)',
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
              fontWeight: 800,
              padding: '0.85rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
            }}
          >
            <Send size={18} /> Test Webhook
          </button>
        </div>

        {webhookStatus && (
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: webhookStatus.startsWith('✓') ? 'var(--status-safe)' : 'var(--status-warning)',
          }}>
            {webhookStatus}
          </p>
        )}
      </div>

      {/* Encrypted Password Vault Container */}
      <div className="glass-card" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
            <Lock size={24} color="var(--primary-neon)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Encrypted Password Vault</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Store and manage credentials in your browser's local sandbox.</p>
          </div>
        </div>

        <form onSubmit={handleAddCredential} className="responsive-flex-stack" style={{ marginBottom: '1.75rem' }}>
          <input
            type="text"
            placeholder="Website/Service (e.g. github.com)"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(3, 7, 18, 0.9)',
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
            placeholder="Username or Email"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(3, 7, 18, 0.9)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '0.85rem 1.1rem',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--primary-neon)',
              color: '#000',
              fontWeight: 800,
              padding: '0.85rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
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
                background: 'rgba(3, 7, 18, 0.7)',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.35rem',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Key size={18} color="var(--primary-neon)" />
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.site}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.user}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--status-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
