import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileScanner } from './components/FileScanner';
import { LinkScanner } from './components/LinkScanner';
import { StatsDashboard } from './components/StatsDashboard';
import { YaraStudio } from './components/YaraStudio';
import { ScanReportModal } from './components/ScanReportModal';
import type { ScanResult, SystemStats } from './types';
import { checkBackendHealth } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'dashboard' | 'yara'>('file');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  const [stats, setStats] = useState<SystemStats>({
    totalScansCount: 24,
    threatsFoundCount: 4,
    definitionsVersion: 'v2.0.2026.08',
    backendOnline: false,
    lastScanTimestamp: 'Just now',
  });

  const refreshHealth = async () => {
    const isHealthy = await checkBackendHealth();
    setBackendOnline(isHealthy);
    setStats((prev) => ({ ...prev, backendOnline: isHealthy }));
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleScanComplete = (result: ScanResult) => {
    setLastScanResult(result);
    setStats((prev) => ({
      ...prev,
      totalScansCount: prev.totalScansCount + 1,
      threatsFoundCount: prev.threatsFoundCount + result.threats.length,
      lastScanTimestamp: result.timestamp,
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Glass Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        onRefreshHealth={refreshHealth}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'file' && <FileScanner onScanComplete={handleScanComplete} />}
        {activeTab === 'url' && <LinkScanner onScanComplete={handleScanComplete} />}
        {activeTab === 'dashboard' && <StatsDashboard stats={stats} />}
        {activeTab === 'yara' && <YaraStudio />}
      </main>

      {/* Scan Analysis Result Modal */}
      <ScanReportModal
        result={lastScanResult}
        onClose={() => setLastScanResult(null)}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
      }}>
        AntiVirus-AKN Security Engine • Enterprise Edition • MIT Licensed
      </footer>
    </div>
  );
}

export default App;

