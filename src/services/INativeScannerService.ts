import { AppItem, FileItem, ScanProgress, ScanResultSummary, ScanType, ThreatItem } from '../types/scanner';

export interface ScanOptions {
  type: ScanType;
  targetAppIds?: string[];
  targetFileIds?: string[];
}

export type ScanProgressCallback = (progress: ScanProgress) => void;

export interface INativeScannerService {
  /**
   * Start a security scan on apps, files, or system.
   * Native Android Implementation will invoke JNI / C++ Engine scanning routines.
   */
  startScan(
    options: ScanOptions,
    onProgress: ScanProgressCallback
  ): Promise<ScanResultSummary>;

  /**
   * Cancel ongoing scan immediately.
   */
  cancelScan(): Promise<boolean>;

  /**
   * Retrieve list of installed applications.
   */
  getInstalledApps(): Promise<AppItem[]>;

  /**
   * Retrieve files for scanning.
   */
  getScanFiles(): Promise<FileItem[]>;

  /**
   * Resolve or quarantine a threat item.
   */
  resolveThreat(threatId: string, action: 'quarantine' | 'delete' | 'ignore'): Promise<boolean>;
}
