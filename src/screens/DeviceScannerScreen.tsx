import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useScanner } from '../context/ScannerContext';
import { AppItem } from '../types/scanner';

export const DeviceScannerScreen: React.FC = () => {
  const {
    apps,
    selectedAppIds,
    toggleSelectApp,
    selectAllApps,
    startScan,
    navigateTo,
  } = useScanner();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectApp, setInspectApp] = useState<AppItem | null>(null);

  const categories = ['All', 'Utility', 'Finance', 'Social', 'Game', 'System', 'Flagged'];

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Flagged') return app.riskLevel !== 'safe';
    return app.category === selectedCategory;
  });

  const isAllSelected =
    filteredApps.length > 0 && filteredApps.every((a) => selectedAppIds.includes(a.id));

  const handleStartScanSelected = () => {
    startScan('apps');
  };

  const getRiskBadgeType = (risk: string) => {
    if (risk === 'danger') return 'danger';
    if (risk === 'warning') return 'warning';
    return 'safe';
  };

  const formatSize = (sizeMb: number | string) => {
    if (typeof sizeMb === 'number') {
      return `${sizeMb} MB`;
    }
    return sizeMb;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Device App Scanner"
        subtitle="Inspect installed app permissions & signatures"
        showBack
        onBackPress={() => navigateTo('SecurityCenter')}
      />

      <View style={styles.topControlSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search installed apps or packages..."
        />

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, isActive && styles.activeChip]}
              >
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selection Bar */}
        <View style={styles.selectionBar}>
          <TouchableOpacity
            style={styles.selectAllBtn}
            onPress={() => selectAllApps(!isAllSelected)}
          >
            <Ionicons
              name={isAllSelected ? 'checkbox' : 'square-outline'}
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Deselect All' : 'Select All Filtered'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.countText}>
            Showing {filteredApps.length} of {apps.length} Apps
          </Text>
        </View>
      </View>

      {/* App List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selectedAppIds.includes(item.id);
          return (
            <Card style={styles.appCard}>
              <View style={styles.appRow}>
                {/* Select Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxTouch}
                  onPress={() => toggleSelectApp(item.id)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                </TouchableOpacity>

                {/* App Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    item.riskLevel === 'danger' && styles.dangerIconContainer,
                  ]}
                >
                  <Ionicons
                    name={(item.icon as any) || 'cube-outline'}
                    size={24}
                    color={item.riskLevel === 'danger' ? Colors.danger : Colors.primary}
                  />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                  <View style={styles.appNameRow}>
                    <Text style={styles.appName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Badge label={item.riskLevel} type={getRiskBadgeType(item.riskLevel)} />
                  </View>
                  <Text style={styles.packageName} numberOfLines={1}>
                    {item.packageName}
                  </Text>
                  <View style={styles.appMetaRow}>
                    <Text style={styles.metaText}>{formatSize(item.sizeMb)}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{item.permissions.length} Permissions</Text>
                  </View>
                </View>

                {/* Details Button */}
                <TouchableOpacity style={styles.infoBtn} onPress={() => setInspectApp(item)}>
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />

      {/* Bottom Floating Action Bar */}
      <View style={styles.floatingFooter}>
        <Button
          title={
            selectedAppIds.length > 0
              ? `Scan Selected Apps (${selectedAppIds.length})`
              : `Scan Installed Apps (${apps.length})`
          }
          onPress={handleStartScanSelected}
          variant="primary"
          size="large"
          icon={<Ionicons name="shield-checkmark" size={20} color="#0A0F1D" />}
        />
      </View>

      {/* App Details Modal */}
      {inspectApp && (
        <Modal
          visible={!!inspectApp}
          transparent
          animationType="slide"
          onRequestClose={() => setInspectApp(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons
                    name={(inspectApp.icon as any) || 'cube'}
                    size={28}
                    color={Colors.primary}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.modalAppName}>{inspectApp.name}</Text>
                    <Text style={styles.modalPkgName}>{inspectApp.packageName}</Text>
                  </View>
                  <Badge label={inspectApp.riskLevel} type={getRiskBadgeType(inspectApp.riskLevel)} />
                </View>
                <TouchableOpacity
                  onPress={() => setInspectApp(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {inspectApp.description && (
                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                    <Text style={styles.warningBoxText}>{inspectApp.description}</Text>
                  </View>
                )}

                <Text style={styles.modalSectionTitle}>Application Details</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Version</Text>
                    <Text style={styles.detailVal}>{inspectApp.version}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Installed Date</Text>
                    <Text style={styles.detailVal}>{inspectApp.installedDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Size</Text>
                    <Text style={styles.detailVal}>{formatSize(inspectApp.sizeMb)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>SHA-256 Hash</Text>
                    <Text
                      style={[styles.detailVal, { fontSize: 11, fontFamily: 'monospace' }]}
                      numberOfLines={1}
                    >
                      {inspectApp.sha256}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSectionTitle}>
                  Requested Permissions ({inspectApp.permissions.length})
                </Text>
                <View style={styles.permList}>
                  {inspectApp.permissions.map((perm) => (
                    <View key={perm} style={styles.permBadge}>
                      <Ionicons name="key-outline" size={14} color={Colors.primary} />
                      <Text style={styles.permText}>{perm}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Close Inspector"
                  onPress={() => setInspectApp(null)}
                  variant="glass"
                  size="medium"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  topControlSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  categoryScroll: {
    marginTop: 10,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.backgroundElevated,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeChipText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 6,
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  appCard: {
    padding: 12,
    marginBottom: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxTouch: {
    paddingRight: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: Colors.dangerGlow,
  },
  appInfo: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  packageName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  appMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  infoBtn: {
    padding: 6,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(10, 15, 29, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAppName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalPkgName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    marginLeft: 10,
  },
  modalBody: {
    marginVertical: 14,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningGlow,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  warningBoxText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 8,
  },
  detailGrid: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailKey: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  detailVal: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  permList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  permText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  modalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
});
