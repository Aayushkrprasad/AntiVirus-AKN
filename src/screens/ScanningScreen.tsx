import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { CircularProgress } from '../components/scanner/CircularProgress';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useScanner } from '../context/ScannerContext';

export const ScanningScreen: React.FC = () => {
  const {
    scanProgress,
    activeScanType,
    abortScan,
    navigateTo,
    lastScanResult,
    isScanning,
  } = useScanner();

  const progressPercent = scanProgress?.progressPercent || 0;
  const isComplete = scanProgress?.isComplete || !isScanning;
  const threatsCount = scanProgress?.threatsFoundCount || (lastScanResult?.threatsFound.length || 0);

  const handleAbort = () => {
    Alert.alert(
      'Abort Security Scan?',
      'Are you sure you want to stop the AntiVirus-AKN scanner? Unscanned files will not be verified.',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        { text: 'Abort Scan', style: 'destructive', onPress: abortScan },
      ]
    );
  };

  const getScanTypeTitle = () => {
    switch (activeScanType) {
      case 'apps':
        return 'Device App Signature Scan';
      case 'files':
        return 'File System Signature Scan';
      case 'deep':
        return 'Deep Malware Heuristic Inspection';
      default:
        return 'Quick Security Audit';
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getScanTypeTitle()}</Text>
        <Text style={styles.headerSubtitle}>
          {isComplete ? 'Scan Finished' : 'AntiVirus-AKN Native Scanner Engine Active'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Animated Circular Progress Gauge */}
        <CircularProgress
          progressPercent={progressPercent}
          size={240}
          strokeWidth={16}
          statusText={isComplete ? (threatsCount > 0 ? 'Threats Found!' : 'Device Secure') : 'Scanning...'}
          isComplete={isComplete}
          hasThreats={threatsCount > 0}
        />

        {/* Live Scan Step Ticker */}
        <Card glowingBorder style={styles.stepCard}>
          <View style={styles.stepHeaderRow}>
            <Ionicons
              name={isComplete ? 'checkmark-circle' : 'sync-circle'}
              size={22}
              color={isComplete ? (threatsCount > 0 ? Colors.danger : Colors.safe) : Colors.primary}
            />
            <Text style={styles.stepTitle}>
              {isComplete ? 'Scan Completed Successfully' : 'Current Engine Pipeline'}
            </Text>
          </View>

          <Text style={styles.stepMessage}>
            {scanProgress?.currentStepMessage || 'Analyzing system signatures and file hashes...'}
          </Text>

          {!isComplete && (
            <View style={styles.itemFeedBox}>
              <Text style={styles.itemFeedLabel}>Currently Inspecting:</Text>
              <Text style={styles.itemFeedName} numberOfLines={1}>
                {scanProgress?.currentItemName || 'System Kernel Objects'}
              </Text>
            </View>
          )}
        </Card>

        {/* Realtime Stats Counter */}
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Text style={styles.statValue}>
              {scanProgress?.scannedCount || 0}/{scanProgress?.totalCount || 10}
            </Text>
            <Text style={styles.statLabel}>Items Checked</Text>
          </Card>

          <Card style={[styles.statBox, threatsCount > 0 ? { borderColor: Colors.danger } : undefined] as any}>
            <Text style={[styles.statValue, { color: threatsCount > 0 ? Colors.danger : Colors.safe }]}>
              {threatsCount}
            </Text>
            <Text style={styles.statLabel}>Threats Detected</Text>
          </Card>
        </View>

        {/* Threat Alert Highlight */}
        {threatsCount > 0 && (
          <Card style={styles.threatAlertCard}>
            <View style={styles.threatAlertRow}>
              <Ionicons name="warning" size={24} color={Colors.danger} />
              <View style={styles.threatAlertTextCol}>
                <Text style={styles.threatAlertTitle}>{threatsCount} Security Threat(s) Found!</Text>
                <Text style={styles.threatAlertDesc}>Potentially unwanted programs or malware detected.</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Action Controls */}
      <View style={styles.footer}>
        {isComplete ? (
          <Button
            title="View Full Scan Results"
            onPress={() => navigateTo('ScanResult')}
            variant={threatsCount > 0 ? 'danger' : 'primary'}
            size="large"
            icon={<Ionicons name="arrow-forward" size={22} color={threatsCount > 0 ? '#FFFFFF' : '#0A0F1D'} />}
          />
        ) : (
          <Button
            title="Abort Security Scan"
            onPress={handleAbort}
            variant="outline"
            size="medium"
            icon={<Ionicons name="close-circle-outline" size={20} color={Colors.primary} />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  stepCard: {
    marginTop: 10,
    padding: 16,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  stepMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  itemFeedBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemFeedLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  itemFeedName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  threatAlertCard: {
    backgroundColor: Colors.dangerGlow,
    borderColor: Colors.danger,
    marginTop: 12,
  },
  threatAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatAlertTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  threatAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.danger,
  },
  threatAlertDesc: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
