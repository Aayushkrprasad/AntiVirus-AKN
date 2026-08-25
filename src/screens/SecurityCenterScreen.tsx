import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useScanner } from '../context/ScannerContext';

export const SecurityCenterScreen: React.FC = () => {
  const { systemStats, startScan, navigateTo, apps } = useScanner();

  const isProtected = systemStats.isProtected;

  const formatMetric = (val: number | string | undefined, suffix: string = '%') => {
    if (val === undefined || val === null || val === 'Unavailable') {
      return 'Unavailable';
    }
    return typeof val === 'number' ? `${val}${suffix}` : `${val}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Protection Banner */}
      <View style={[styles.heroCard, isProtected ? styles.heroProtected : styles.heroThreat]}>
        <View style={styles.heroHeader}>
          <View style={[styles.shieldOuterRing, { borderColor: isProtected ? Colors.safe : Colors.danger }]}>
            <View style={[styles.shieldInnerIcon, { backgroundColor: isProtected ? Colors.safeGlow : Colors.dangerGlow }]}>
              <Ionicons
                name={isProtected ? 'shield-checkmark' : 'shield-half'}
                size={48}
                color={isProtected ? Colors.safe : Colors.danger}
              />
            </View>
          </View>

          <View style={styles.heroTextContainer}>
            <Badge
              label={isProtected ? 'Protected' : 'Action Required'}
              type={isProtected ? 'safe' : 'danger'}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.heroTitle}>
              {isProtected ? 'Device Protected' : 'Potential Threats Detected'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Protection Score: <Text style={{ color: isProtected ? Colors.safe : Colors.danger, fontWeight: '800' }}>{systemStats.protectionScore}/100</Text>
            </Text>
          </View>
        </View>

        <View style={styles.lastScanRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.lastScanText}>Last scan: {systemStats.lastScanTimestamp}</Text>
          <Text style={styles.versionText}>{systemStats.virusDefinitionsVersion}</Text>
        </View>

        {/* Start Scan Main Action Button */}
        <Button
          title="Start Quick Scan"
          onPress={() => startScan('quick')}
          variant={isProtected ? 'primary' : 'danger'}
          size="large"
          icon={<Ionicons name="scan-outline" size={22} color={isProtected ? '#0A0F1D' : '#FFFFFF'} />}
          style={styles.mainScanBtn}
        />
      </View>

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>Scanner Modules</Text>
      <View style={styles.moduleGrid}>
        {/* Scan Apps */}
        <Card glowingBorder onPress={() => navigateTo('DeviceScanner')} style={styles.moduleCard}>
          <View style={[styles.moduleIconWrapper, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
            <Ionicons name="apps" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.moduleTitle}>Scan Apps</Text>
          <Text style={styles.moduleDesc}>Inspect {apps.length} installed application{apps.length === 1 ? '' : 's'} & permissions</Text>
          <View style={styles.moduleFooter}>
            <Text style={styles.moduleActionText}>Open Device Scanner</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </View>
        </Card>

        {/* Scan Files */}
        <Card glowingBorder onPress={() => navigateTo('FileScanner')} style={styles.moduleCard}>
          <View style={[styles.moduleIconWrapper, { backgroundColor: 'rgba(58, 134, 255, 0.15)' }]}>
            <Ionicons name="folder-open" size={28} color={Colors.secondary} />
          </View>
          <Text style={styles.moduleTitle}>Scan Files</Text>
          <Text style={styles.moduleDesc}>Check documents, APK downloads & local storage</Text>
          <View style={styles.moduleFooter}>
            <Text style={[styles.moduleActionText, { color: Colors.secondary }]}>Open File Scanner</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
          </View>
        </Card>
      </View>

      {/* System Metrics Bar */}
      <Text style={styles.sectionTitle}>System Health Metrics</Text>
      <Card style={styles.metricsCard}>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
            <Text style={styles.metricValue}>{formatMetric(systemStats.ramUsagePercent, '%')}</Text>
            <Text style={styles.metricLabel}>RAM Usage</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricItem}>
            <Ionicons name="disc-outline" size={20} color={Colors.secondary} />
            <Text style={styles.metricValue}>{formatMetric(systemStats.storageUsagePercent, '%')}</Text>
            <Text style={styles.metricLabel}>Storage</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricItem}>
            <Ionicons name="thermometer-outline" size={20} color={Colors.warning} />
            <Text style={styles.metricValue}>{formatMetric(systemStats.batteryTempCelsius, '°C')}</Text>
            <Text style={styles.metricLabel}>Battery Temp</Text>
          </View>
        </View>
      </Card>

      {/* Quick Protection Status */}
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.safe} />
          <View style={styles.statusTextCol}>
            <Text style={styles.statusTitle}>Real-time App Guard</Text>
            <Text style={styles.statusDesc}>Active security protection enabled</Text>
          </View>
          <Badge label="ACTIVE" type="safe" />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  heroProtected: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  heroThreat: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shieldInnerIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  lastScanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastScanText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  mainScanBtn: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 10,
  },
  moduleGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  moduleCard: {
    padding: 16,
  },
  moduleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  moduleDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  metricsCard: {
    paddingVertical: 14,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  statusCard: {
    marginTop: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
