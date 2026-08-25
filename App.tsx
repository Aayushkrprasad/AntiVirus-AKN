import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/theme/colors';
import { ScannerProvider, useScanner } from './src/context/ScannerContext';
import { SecurityCenterScreen } from './src/screens/SecurityCenterScreen';
import { DeviceScannerScreen } from './src/screens/DeviceScannerScreen';
import { FileScannerScreen } from './src/screens/FileScannerScreen';
import { ScanningScreen } from './src/screens/ScanningScreen';
import { ScanResultScreen } from './src/screens/ScanResultScreen';
import { PasswordVaultScreen } from './src/screens/PasswordVaultScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNavBar } from './src/components/navigation/BottomNavBar';

const MainAppContent: React.FC = () => {
  const { navState } = useScanner();

  const renderCurrentScreen = () => {
    switch (navState.currentScreen) {
      case 'SecurityCenter':
        return <SecurityCenterScreen />;
      case 'DeviceScanner':
        return <DeviceScannerScreen />;
      case 'FileScanner':
        return <FileScannerScreen />;
      case 'Scanning':
        return <ScanningScreen />;
      case 'ScanResult':
        return <ScanResultScreen />;
      case 'PasswordVault':
        return <PasswordVaultScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <SecurityCenterScreen />;
    }
  };

  // Hide bottom navigation bar during full-screen active scanning
  const showBottomNav = navState.currentScreen !== 'Scanning';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>{renderCurrentScreen()}</View>
      {showBottomNav && <BottomNavBar />}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ScannerProvider>
        <MainAppContent />
      </ScannerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
});
