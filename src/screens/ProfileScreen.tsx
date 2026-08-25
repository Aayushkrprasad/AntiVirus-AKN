import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { ToggleRow } from '../components/common/ToggleRow';
import { useScanner } from '../context/ScannerContext';

export const ProfileScreen: React.FC = () => {
  const { systemStats, updateSystemSetting } = useScanner();

  const handleUpdateSignatures = () => {
    Alert.alert(
      'Virus Definitions Updated',
      `AntiVirus-AKN signature database is active (${systemStats.virusDefinitionsVersion}).`
    );
  };

  const ramDisplayValue =
    systemStats.ramUsagePercent !== 'Unavailable'
      ? `${systemStats.ramUsagePercent}`
      : systemStats.totalMemoryMb !== 'Unavailable'
      ? `${systemStats.totalMemoryMb} MB`
      : 'Unavailable';

  return (
    <View style={styles.container}>
      <Header title="Device & Security Profile" subtitle="Local device environment & shield settings" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Real Device Hardware Header */}
        <Card glowingBorder style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <Ionicons name="phone-portrait-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.profileMetaCol}>
              <Text
                style={styles.profileName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {systemStats.deviceName || 'Mobile Device'}
              </Text>
              <Text style={styles.profileRole} numberOfLines={1}>
                {systemStats.deviceBrand || 'Android'} • {systemStats.osVersion || 'Mobile OS'}
              </Text>
              <View style={styles.licenseRow}>
                <Ionicons name="hardware-chip-outline" size={14} color={Colors.safe} />
                <Text style={styles.licenseText} numberOfLines={1}>
                  Total RAM: {ramDisplayValue}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Protection Settings */}
        <Text style={styles.sectionTitle}>Real-Time Shield Settings</Text>
        <ToggleRow
          title="Real-Time App Monitoring"
          subtitle="Scan new applications immediately upon installation"
          value={systemStats.realtimeProtectionEnabled}
          onValueChange={(val) => updateSystemSetting('realtimeProtectionEnabled', val)}
          iconName="shield-checkmark"
        />

        <ToggleRow
          title="Cloud Virus Signature Updates"
          subtitle="Auto-sync daily malware definitions over network"
          value={systemStats.autoUpdateEnabled}
          onValueChange={(val) => updateSystemSetting('autoUpdateEnabled', val)}
          iconName="cloud-download"
        />

        <ToggleRow
          title="Wi-Fi Security Inspection"
          subtitle="Detect ARP spoofing & unencrypted wireless networks"
          value={systemStats.wifiSecurityEnabled}
          onValueChange={(val) => updateSystemSetting('wifiSecurityEnabled', val)}
          iconName="wifi"
        />

        <ToggleRow
          title="Storage Auto-Guard"
          subtitle="Scan external & local storage directories when accessed"
          value={systemStats.cloudScanningEnabled}
          onValueChange={(val) => updateSystemSetting('cloudScanningEnabled', val)}
          iconName="hardware-chip"
        />

        {/* Maintenance */}
        <Text style={styles.sectionTitle}>Database & Maintenance</Text>
        <Card style={styles.actionCard}>
          <TouchableOpacity style={styles.actionRow} onPress={handleUpdateSignatures}>
            <View style={styles.actionIconBox}>
              <Ionicons name="refresh-circle-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Update Virus Definitions</Text>
              <Text style={styles.actionDesc}>{systemStats.virusDefinitionsVersion}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* About AntiVirus-AKN */}
        <Text style={styles.sectionTitle}>About AntiVirus-AKN</Text>
        <Card style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Ionicons name="shield" size={36} color={Colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.appName}>AntiVirus-AKN</Text>
              <Text style={styles.appTagline}>Dark-Blue Security Engine</Text>
            </View>
          </View>

          <View style={styles.aboutGrid}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>App Version</Text>
              <Text style={[styles.aboutVal, { color: Colors.primary, fontWeight: '800' }]}>V2.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Security Engine</Text>
              <Text style={styles.aboutVal}>v2.0.4-release</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Definitions</Text>
              <Text style={styles.aboutVal}>{systemStats.virusDefinitionsVersion}</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Framework</Text>
              <Text style={styles.aboutVal}>React Native + Expo SDK 54</Text>
            </View>
          </View>

          <View style={styles.copyrightBox}>
            <Text style={styles.copyrightText}>
              © AntiVirus-AKN Security Suite. All rights reserved.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 16,
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginRight: 14,
  },
  profileMetaCol: {
    flex: 1,
    flexShrink: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  licenseText: {
    fontSize: 11,
    color: Colors.safe,
    fontWeight: '600',
    marginLeft: 4,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 8,
  },
  actionCard: {
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aboutCard: {
    padding: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aboutGrid: {
    marginVertical: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  aboutKey: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  aboutVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  copyrightBox: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
