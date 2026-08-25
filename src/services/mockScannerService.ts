import { INativeScannerService, ScanOptions, ScanProgressCallback } from './INativeScannerService';
import { AppItem, FileItem, ScanProgress, ScanResultSummary, ThreatItem } from '../types/scanner';
import { MOCK_APPS, MOCK_FILES, MOCK_THREATS, SCAN_STEPS } from './mockData';

export class MockScannerService implements INativeScannerService {
  private isScanning = false;
  private currentProgress: ScanProgress | null = null;
  private activeTimer: any = null;

  async getInstalledApps(): Promise<AppItem[]> {
    return [...MOCK_APPS];
  }

  async getScanFiles(): Promise<FileItem[]> {
    return [...MOCK_FILES];
  }

  async startScan(
    options: ScanOptions,
    onProgress: ScanProgressCallback
  ): Promise<ScanResultSummary> {
    this.isScanning = true;

    // Determine target items
    let targetApps = MOCK_APPS;
    let targetFiles = MOCK_FILES;

    if (options.targetAppIds && options.targetAppIds.length > 0) {
      targetApps = MOCK_APPS.filter((a) => options.targetAppIds?.includes(a.id));
    }
    if (options.targetFileIds && options.targetFileIds.length > 0) {
      targetFiles = MOCK_FILES.filter((f) => options.targetFileIds?.includes(f.id));
    }

    const itemsToScanCount =
      options.type === 'apps'
        ? targetApps.length
        : options.type === 'files'
        ? targetFiles.length
        : targetApps.length + targetFiles.length;

    const totalSteps = SCAN_STEPS.length;
    let currentStepIdx = 0;
    let scannedCount = 0;
    let threatsFoundList: ThreatItem[] = [];

    return new Promise<ScanResultSummary>((resolve) => {
      const intervalTime = 600; // ms per tick for realistic smooth scan speed

      this.activeTimer = setInterval(() => {
        if (!this.isScanning) {
          clearInterval(this.activeTimer);
          return;
        }

        const progressPercent = Math.min(100, Math.round(((scannedCount + 1) / itemsToScanCount) * 100));
        currentStepIdx = Math.floor((progressPercent / 100) * (totalSteps - 1));

        let currentItemName = '';
        if (options.type === 'apps') {
          currentItemName = targetApps[scannedCount % targetApps.length]?.name || 'App Package';
        } else if (options.type === 'files') {
          currentItemName = targetFiles[scannedCount % targetFiles.length]?.name || 'File Object';
        } else {
          const allItems = [...targetApps, ...targetFiles];
          currentItemName = (allItems[scannedCount % allItems.length] as any)?.name || 'System Object';
        }

        // Simulate threat detection at certain progress checkpoints
        if (progressPercent > 40 && threatsFoundList.length === 0) {
          threatsFoundList.push(MOCK_THREATS[0]);
        }
        if (progressPercent > 75 && threatsFoundList.length === 1 && (options.type === 'files' || options.type === 'quick' || options.type === 'deep')) {
          threatsFoundList.push(MOCK_THREATS[1]);
        }

        scannedCount++;

        const progressState: ScanProgress = {
          scannedCount: Math.min(scannedCount, itemsToScanCount),
          totalCount: itemsToScanCount,
          progressPercent,
          currentStepIndex: currentStepIdx,
          currentStepMessage: SCAN_STEPS[currentStepIdx],
          currentItemName,
          threatsFoundCount: threatsFoundList.length,
          isComplete: progressPercent >= 100,
          isAborted: false,
        };

        this.currentProgress = progressState;
        onProgress(progressState);

        if (progressPercent >= 100) {
          clearInterval(this.activeTimer);
          this.isScanning = false;

          const hasThreats = threatsFoundList.length > 0;
          const result: ScanResultSummary = {
            id: `scan-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            scanType: options.type,
            totalItemsScanned: itemsToScanCount,
            threatsFound: threatsFoundList,
            overallStatus: hasThreats ? 'threats_found' : 'clean',
            securityScore: hasThreats ? Math.max(50, 100 - threatsFoundList.length * 20) : 100,
            durationSeconds: Math.round((itemsToScanCount * intervalTime) / 1000),
          };

          resolve(result);
        }
      }, intervalTime);
    });
  }

  async cancelScan(): Promise<boolean> {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
    }
    this.isScanning = false;
    if (this.currentProgress) {
      this.currentProgress.isAborted = true;
    }
    return true;
  }

  async resolveThreat(threatId: string, action: 'quarantine' | 'delete' | 'ignore'): Promise<boolean> {
    const threat = MOCK_THREATS.find((t) => t.id === threatId);
    if (threat) {
      threat.status = action === 'quarantine' ? 'quarantined' : action === 'delete' ? 'resolved' : 'ignored';
      return true;
    }
    return false;
  }
}

export const mockScannerService = new MockScannerService();
