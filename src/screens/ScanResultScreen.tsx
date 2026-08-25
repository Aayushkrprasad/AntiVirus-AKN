import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useScanner } from '../context/ScannerContext';

export const ScanResultScreen: React.FC = () => {
  const { lastScanResult, resolveThreat, navigateTo } = useScanner();

  const threats = lastScanResult?.threatsFound || [];
  const isClean = threats.length === 0 || threats.every((t) => t.status !== 'active');
  const score = lastScanResult?.securityScore || 100;

  return (
    <View style={styles.container}>
      <Header
        title="Scan Inspection Report"
        subtitle={`Engine Signature Audit #${lastScanResult?.id.slice(-6) || '2026'}`}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Hero Card */}
        <Card
          glowingBorder
          style={[styles.heroCard, isClean ? styles.cleanHero : styles.threatHero] as any}
        >
          <View style={styles.heroRow}>
            <View
              style={[
                styles.statusIconBox,
                { backgroundColor: isClean ? Colors.safeGlow : Colors.dangerGlow },
              ]}
            >
              <Ionicons
                name={isClean ? 'shield-checkmark' : 'alert-circle'}
                size={40}
                color={isClean ? Colors.safe : Colors.danger}
              />
            </View>

            <View style={styles.heroTextCol}>
              <Badge
                label={isClean ? 'System Safe' : `${threats.filter((t) => t.status === 'active').length} Threats Active`}
                type={isClean ? 'safe' : 'danger'}
              />
              <Text style={styles.heroTitle}>
                {isClean ? 'No Malware Threats Detected' : 'Security Vulnerabilities Found'}
              </Text>
              <Text style={styles.heroScore}>
                Threat Score Rating: <Text style={{ color: isClean ? Colors.safe : Colors.danger, fontWeight: '800' }}>{score}/100</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Scan Details Overview Grid */}
        <Text style={styles.sectionTitle}>Audit Details</Text>
        <Card style={styles.auditDetailsCard}>
          <View style={styles.auditGrid}>
            <View style={styles.auditItem}>
              <Text style={styles.auditKey}>Items Scanned</Text>
              <Text style={styles.auditVal}>{lastScanResult?.totalItemsScanned || 29}</Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditKey}>Duration</Text>
              <Text style={styles.auditVal}>{lastScanResult?.durationSeconds || 6}s</Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditKey}>Scan Mode</Text>
              <Text style={[styles.auditVal, { textTransform: 'uppercase' }]}>
                {lastScanResult?.scanType || 'Quick'}
              </Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditKey}>Timestamp</Text>
              <Text style={styles.auditVal}>{lastScanResult?.timestamp || 'Just now'}</Text>
            </View>
          </View>
        </Card>

        {/* Flagged Items / Threat List */}
        <Text style={styles.sectionTitle}>
          {isClean ? 'Passed Integrity Verification' : `Flagged Security Threats (${threats.length})`}
        </Text>

        {threats.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={36} color={Colors.safe} />
            <Text style={styles.emptyTitle}>100% Signature Match Clean</Text>
            <Text style={styles.emptyDesc}>
              All scanned files and installed application packages match legitimate developer hashes.
            </Text>
          </Card>
        ) : (
          threats.map((threat) => {
            const isHandled = threat.status !== 'active';
            return (
              <Card
                key={threat.id}
                style={[
                  styles.threatCard,
                  isHandled ? styles.handledThreatCard : styles.activeThreatCard,
                ] as any}
              >
                <View style={styles.threatHeader}>
                  <View style={styles.threatTitleRow}>
                    <Ionicons
                      name={isHandled ? 'checkmark-circle' : 'warning'}
                      size={22}
                      color={isHandled ? Colors.safe : Colors.danger}
                    />
                    <Text style={styles.threatName} numberOfLines={1}>{threat.threatName}</Text>
                  </View>
                  <Badge label={threat.status} type={isHandled ? 'safe' : 'danger'} />
                </View>

                <View style={styles.threatTargetBox}>
                  <Text style={styles.targetLabel}>Affected Target:</Text>
                  <Text style={styles.targetName}>{threat.targetName}</Text>
                  <Text style={styles.targetPath} numberOfLines={1}>{threat.targetPath}</Text>
                </View>

                <Text style={styles.threatDesc}>{threat.description}</Text>

                <View style={styles.recomBox}>
                  <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
                  <Text style={styles.recomText}>{threat.recommendation}</Text>
                </View>

                {/* Resolution Action Buttons */}
                {!isHandled && (
                  <View style={styles.actionRow}>
                    <Button
                      title="Quarantine"
                      onPress={() => resolveThreat(threat.id, 'quarantine')}
                      variant="danger"
                      size="small"
                      icon={<Ionicons name="lock-closed" size={14} color="#FFF" />}
                    />
                    <Button
                      title="Delete"
                      onPress={() => resolveThreat(threat.id, 'delete')}
                      variant="secondary"
                      size="small"
                      icon={<Ionicons name="trash-outline" size={14} color="#FFF" />}
                    />
                    <Button
                      title="Ignore"
                      onPress={() => resolveThreat(threat.id, 'ignore')}
                      variant="glass"
                      size="small"
                    />
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <Button
          title="Done & Return to Home"
          onPress={() => navigateTo('SecurityCenter')}
          variant="primary"
          size="large"
          icon={<Ionicons name="checkmark-done-circle" size={24} color="#0A0F1D" />}
        />
      </View>
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
    paddingBottom: 90,
  },
  heroCard: {
    padding: 18,
    borderWidth: 1.5,
  },
  cleanHero: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  threatHero: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  heroScore: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  auditDetailsCard: {
    paddingVertical: 12,
  },
  auditGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  auditItem: {
    width: '50%',
    paddingHorizontal: 12,
  },
  auditKey: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  auditVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  threatCard: {
    padding: 16,
  },
  activeThreatCard: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  handledThreatCard: {
    opacity: 0.7,
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  threatName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  threatTargetBox: {
    backgroundColor: Colors.backgroundElevated,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  targetLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  targetName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  targetPath: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  threatDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  recomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningGlow,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  recomText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 6,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
