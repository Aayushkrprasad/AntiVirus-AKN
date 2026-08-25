import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppItem,
  FileItem,
  PasswordCredential,
  ScanProgress,
  ScanResultSummary,
  ScanType,
  SystemStats,
  ThreatItem,
} from '../types/scanner';
import { realDeviceService } from '../services/realDeviceService';

export type ScreenName =
  | 'SecurityCenter'
  | 'DeviceScanner'
  | 'FileScanner'
  | 'Scanning'
  | 'ScanResult'
  | 'PasswordVault'
  | 'Profile';

export interface NavigationState {
  currentScreen: ScreenName;
  activeTab: 'Security' | 'Password' | 'Profile';
  params?: any;
}

interface ScannerContextType {
  systemStats: SystemStats;
  navState: NavigationState;
  navigateTo: (screen: ScreenName, params?: any) => void;
  setActiveTab: (tab: 'Security' | 'Password' | 'Profile') => void;

  apps: AppItem[];
  files: FileItem[];
  selectedAppIds: string[];
  selectedFileIds: string[];
  toggleSelectApp: (id: string) => void;
  toggleSelectFile: (id: string) => void;
  selectAllApps: (select: boolean) => void;
  selectAllFiles: (select: boolean) => void;

  passwords: PasswordCredential[];
  addPasswordCredential: (site: string, usernameOrEmail: string) => Promise<void>;
  deletePasswordCredential: (id: string) => Promise<void>;

  activeScanType: ScanType;
  scanProgress: ScanProgress | null;
  lastScanResult: ScanResultSummary | null;
  isScanning: boolean;

  refreshStats: () => Promise<void>;
  startScan: (type: ScanType) => void;
  abortScan: () => void;
  resolveThreat: (threatId: string, action: 'quarantine' | 'delete' | 'ignore') => void;
  updateSystemSetting: (key: keyof SystemStats, value: any) => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

const STORAGE_KEY_PASSWORDS = '@akn_vault_passwords_v1';

export const ScannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    protectionScore: 100,
    isProtected: true,
    lastScanTimestamp: 'Never scanned',
    ramUsagePercent: 'Unavailable',
    storageUsagePercent: 'Unavailable',
    batteryTempCelsius: 'Unavailable',
    batteryLevelPercent: 'Unavailable',
    virusDefinitionsVersion: 'v2.0.2026.08',
    realtimeProtectionEnabled: true,
    cloudScanningEnabled: true,
    wifiSecurityEnabled: true,
    autoUpdateEnabled: true,
  });

  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'SecurityCenter',
    activeTab: 'Security',
  });

  const [apps, setApps] = useState<AppItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [passwords, setPasswords] = useState<PasswordCredential[]>([]);

  const [activeScanType, setActiveScanType] = useState<ScanType>('quick');
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResultSummary | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const refreshStats = async () => {
    try {
      const stats = await realDeviceService.getRealSystemStats();
      setSystemStats((prev) => ({
        ...stats,
        lastScanTimestamp: prev.lastScanTimestamp,
        protectionScore: prev.protectionScore,
        isProtected: prev.isProtected,
      }));
    } catch {
      // Fallback
    }
  };

  const loadLocalData = async () => {
    await refreshStats();
    const realAppsList = await realDeviceService.getInstalledApps();
    const realFilesList = await realDeviceService.getScanFiles();
    setApps(realAppsList);
    setFiles(realFilesList);

    try {
      const storedPassJson = await AsyncStorage.getItem(STORAGE_KEY_PASSWORDS);
      if (storedPassJson) {
        setPasswords(JSON.parse(storedPassJson));
      } else {
        setPasswords([]);
      }
    } catch {
      setPasswords([]);
    }
  };

  useEffect(() => {
    loadLocalData();
  }, []);

  const addPasswordCredential = async (site: string, usernameOrEmail: string) => {
    const newItem: PasswordCredential = {
      id: `cred-${Date.now()}`,
      site,
      usernameOrEmail,
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newItem, ...passwords];
    setPasswords(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(updated));
    } catch {
      // Handle storage error
    }
  };

  const deletePasswordCredential = async (id: string) => {
    const updated = passwords.filter((p) => p.id !== id);
    setPasswords(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(updated));
    } catch {
      // Handle storage error
    }
  };

  const navigateTo = (screen: ScreenName, params?: any) => {
    let newTab: 'Security' | 'Password' | 'Profile' = navState.activeTab;
    if (
      screen === 'SecurityCenter' ||
      screen === 'DeviceScanner' ||
      screen === 'FileScanner' ||
      screen === 'Scanning' ||
      screen === 'ScanResult'
    ) {
      newTab = 'Security';
    } else if (screen === 'PasswordVault') {
      newTab = 'Password';
    } else if (screen === 'Profile') {
      newTab = 'Profile';
    }
    setNavState({ currentScreen: screen, activeTab: newTab, params });
  };

  const setActiveTab = (tab: 'Security' | 'Password' | 'Profile') => {
    if (tab === 'Security') {
      navigateTo('SecurityCenter');
    } else if (tab === 'Password') {
      navigateTo('PasswordVault');
    } else if (tab === 'Profile') {
      navigateTo('Profile');
    }
  };

  const toggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllApps = (select: boolean) => {
    setSelectedAppIds(select ? apps.map((a) => a.id) : []);
  };

  const selectAllFiles = (select: boolean) => {
    setSelectedFileIds(select ? files.map((f) => f.id) : []);
  };

  const startScan = (type: ScanType) => {
    setActiveScanType(type);
    setIsScanning(true);
    setScanProgress({
      scannedCount: 0,
      totalCount: 1,
      progressPercent: 0,
      currentStepIndex: 0,
      currentStepMessage: 'Initializing AntiVirus-AKN Device Engine...',
      currentItemName: 'Device Hardware Partition',
      threatsFoundCount: 0,
      isComplete: false,
      isAborted: false,
    });

    navigateTo('Scanning');

    realDeviceService
      .startScan(
        {
          type,
          targetAppIds: type === 'apps' ? selectedAppIds : undefined,
          targetFileIds: type === 'files' ? selectedFileIds : undefined,
        },
        (progress) => {
          setScanProgress(progress);
        }
      )
      .then((result) => {
        setIsScanning(false);
        setLastScanResult(result);
        setSystemStats((prev) => ({
          ...prev,
          protectionScore: result.securityScore,
          isProtected: result.overallStatus === 'clean',
          lastScanTimestamp: 'Just now',
        }));
      });
  };

  const abortScan = () => {
    realDeviceService.cancelScan().then(() => {
      setIsScanning(false);
      setScanProgress(null);
      navigateTo('SecurityCenter');
    });
  };

  const resolveThreat = (threatId: string, action: 'quarantine' | 'delete' | 'ignore') => {
    realDeviceService.resolveThreat(threatId, action).then(() => {
      if (lastScanResult) {
        const updatedThreats = lastScanResult.threatsFound.map((t) =>
          t.id === threatId
            ? {
                ...t,
                status: action === 'quarantine' ? 'quarantined' : action === 'delete' ? 'resolved' : 'ignored',
              }
            : t
        );
        const remainingActive = updatedThreats.filter((t) => t.status === 'active').length;
        const newScore = remainingActive === 0 ? 100 : Math.max(50, 100 - remainingActive * 20);

        setLastScanResult({
          ...lastScanResult,
          threatsFound: updatedThreats as ThreatItem[],
          securityScore: newScore,
          overallStatus: remainingActive === 0 ? 'clean' : 'threats_found',
        });

        setSystemStats((prev) => ({
          ...prev,
          protectionScore: newScore,
          isProtected: remainingActive === 0,
        }));
      }
    });
  };

  const updateSystemSetting = (key: keyof SystemStats, value: any) => {
    setSystemStats((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScannerContext.Provider
      value={{
        systemStats,
        navState,
        navigateTo,
        setActiveTab,
        apps,
        files,
        selectedAppIds,
        selectedFileIds,
        toggleSelectApp,
        toggleSelectFile,
        selectAllApps,
        selectAllFiles,
        passwords,
        addPasswordCredential,
        deletePasswordCredential,
        activeScanType,
        scanProgress,
        lastScanResult,
        isScanning,
        refreshStats,
        startScan,
        abortScan,
        resolveThreat,
        updateSystemSetting,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};
