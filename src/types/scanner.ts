export type ScanType = 'quick' | 'apps' | 'files' | 'deep';

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  version: string;
  icon: string;
  sizeMb: number | string;
  permissions: string[];
  riskLevel: RiskLevel;
  category: 'System' | 'Social' | 'Finance' | 'Utility' | 'Game' | 'Productivity';
  installedDate: string;
  sha256: string;
  threatName?: string;
  description?: string;
  isSelected?: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  extension: string;
  sizeKb: number | string;
  modifiedDate: string;
  riskLevel: RiskLevel;
  type: 'document' | 'apk' | 'archive' | 'media' | 'executable' | 'script';
  threatName?: string;
  hash: string;
  isSelected?: boolean;
}

export interface ThreatItem {
  id: string;
  title: string;
  targetName: string;
  targetPath: string;
  targetType: 'app' | 'file';
  riskLevel: RiskLevel;
  threatName: string;
  threatCategory: 'Trojan' | 'Adware' | 'Spyware' | 'Ransomware' | 'PUP' | 'Riskware';
  description: string;
  recommendation: string;
  status: 'active' | 'quarantined' | 'resolved' | 'ignored';
}

export interface ScanProgress {
  scannedCount: number;
  totalCount: number;
  progressPercent: number; // 0 to 100
  currentStepIndex: number;
  currentStepMessage: string;
  currentItemName: string;
  threatsFoundCount: number;
  isComplete: boolean;
  isAborted: boolean;
}

export interface ScanResultSummary {
  id: string;
  timestamp: string;
  scanType: ScanType;
  totalItemsScanned: number;
  threatsFound: ThreatItem[];
  overallStatus: 'clean' | 'threats_found';
  securityScore: number; // 0 to 100
  durationSeconds: number;
}

export interface SystemStats {
  protectionScore: number; // 0 to 100
  isProtected: boolean;
  lastScanTimestamp: string;
  ramUsagePercent: number | string; // e.g. 45 or "Unavailable"
  storageUsagePercent: number | string; // e.g. 62 or "Unavailable"
  batteryTempCelsius: number | string; // e.g. 34.2 or "Unavailable"
  batteryLevelPercent?: number | string; // e.g. 85 or "Unavailable"
  deviceName?: string;
  osVersion?: string;
  deviceBrand?: string;
  totalMemoryMb?: number | string;
  virusDefinitionsVersion: string;
  realtimeProtectionEnabled: boolean;
  cloudScanningEnabled: boolean;
  wifiSecurityEnabled: boolean;
  autoUpdateEnabled: boolean;
}

export interface PasswordCredential {
  id: string;
  site: string;
  usernameOrEmail: string;
  passwordHash?: string;
  createdAt: string;
}
