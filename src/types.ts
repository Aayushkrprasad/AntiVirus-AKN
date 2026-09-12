export type RiskLevel = 'safe' | 'warning' | 'danger';

export type ThreatCategory = 'Trojan' | 'Adware' | 'Spyware' | 'Ransomware' | 'PUP' | 'Riskware' | 'Phishing';

export interface ThreatItem {
  id: string;
  name: string;
  type: ThreatCategory;
  severity: RiskLevel;
  target: string;
  description: string;
  recommendation: string;
  status: 'active' | 'quarantined' | 'resolved' | 'ignored';
}

export interface FileScanMeta {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  md5: string;
  sha256: string;
  entropy: number;
  isHighEntropy: boolean;
}

export interface URLScanMeta {
  rawUrl: string;
  scheme: string;
  domain: string;
  hostname: string;
  tld: string;
  isIp: boolean;
  isSsl: boolean;
  statusCode?: number;
}

export interface ScanResult {
  scanId: string;
  timestamp: string;
  scanType: 'file' | 'url' | 'apk';
  status: 'clean' | 'threats_found';
  riskLevel: RiskLevel;
  securityScore: number;
  durationSeconds: number;
  scannedItemName: string;
  threats: ThreatItem[];
  fileMeta?: FileScanMeta;
  urlMeta?: URLScanMeta;
}

export interface SystemStats {
  totalScansCount: number;
  threatsFoundCount: number;
  definitionsVersion: string;
  backendOnline: boolean;
  lastScanTimestamp: string;
}
