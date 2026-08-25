import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useScanner } from '../context/ScannerContext';

export const FileScannerScreen: React.FC = () => {
  const {
    files,
    selectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    startScan,
    navigateTo,
  } = useScanner();

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const fileCategories = [
    { id: 'All', label: 'All Files', icon: 'folder' },
    { id: 'apk', label: 'APKs & Installers', icon: 'logo-android' },
    { id: 'executable', label: 'Executables', icon: 'terminal' },
    { id: 'document', label: 'Documents', icon: 'document-text' },
    { id: 'archive', label: 'Archives', icon: 'archive' },
    { id: 'script', label: 'Scripts', icon: 'code-slash' },
  ];

  const filteredFiles = files.filter((f) => {
    if (activeCategory === 'All') return true;
    return f.type === activeCategory;
  });

  const selectedFilesList = files.filter((f) => selectedFileIds.includes(f.id));
  const totalSelectedSizeKb = selectedFilesList.reduce(
    (acc, f) => acc + (typeof f.sizeKb === 'number' ? f.sizeKb : 0),
    0
  );
  const totalSelectedSizeMb = (totalSelectedSizeKb / 1024).toFixed(2);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'apk':
        return 'logo-android';
      case 'executable':
        return 'warning';
      case 'archive':
        return 'archive-outline';
      case 'script':
        return 'code-working-outline';
      default:
        return 'document-text-outline';
    }
  };

  const getRiskBadgeType = (risk: string) => {
    if (risk === 'danger') return 'danger';
    if (risk === 'warning') return 'warning';
    return 'safe';
  };

  const formatFileSize = (sizeKb: number | string) => {
    if (typeof sizeKb === 'number') {
      return `${(sizeKb / 1024).toFixed(2)} MB`;
    }
    return sizeKb;
  };

  return (
    <View style={styles.container}>
      <Header
        title="File & Directory Scanner"
        subtitle="Analyze custom files, APK downloads & local storage"
        showBack
        onBackPress={() => navigateTo('SecurityCenter')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* File Category Picker Quick Grid */}
        <Text style={styles.sectionTitle}>File Quick Select</Text>
        <View style={styles.categoryGrid}>
          {fileCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[styles.catCard, isActive && styles.activeCatCard]}
              >
                <Ionicons
                  name={(cat.icon as any) || 'folder'}
                  size={22}
                  color={isActive ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.catText, isActive && styles.activeCatText]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected File Summary Banner */}
        <Card glowingBorder style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="documents-outline" size={26} color={Colors.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>
                {selectedFileIds.length > 0
                  ? `${selectedFileIds.length} File(s) Selected`
                  : 'No Files Selected'}
              </Text>
              <Text style={styles.summarySubtitle}>
                {selectedFileIds.length > 0
                  ? `Total payload size: ${totalSelectedSizeMb} MB`
                  : 'Tap below to select files for signature scanning'}
              </Text>
            </View>
            {selectedFileIds.length > 0 && (
              <TouchableOpacity onPress={() => selectAllFiles(false)} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* File Browser Header */}
        <View style={styles.fileHeaderRow}>
          <Text style={styles.sectionTitle}>Target Files Queue ({filteredFiles.length})</Text>
          <TouchableOpacity onPress={() => selectAllFiles(selectedFileIds.length !== files.length)}>
            <Text style={styles.selectAllLink}>
              {selectedFileIds.length === files.length && files.length > 0
                ? 'Deselect All'
                : 'Select All Files'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* File List */}
        {filteredFiles.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Accessible Files Found</Text>
            <Text style={styles.emptyDesc}>
              No files detected in application document and cache directories.
            </Text>
          </Card>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <Card key={file.id} style={styles.fileCard}>
                <TouchableOpacity
                  style={styles.fileRow}
                  onPress={() => toggleSelectFile(file.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                    style={styles.checkbox}
                  />

                  <View
                    style={[
                      styles.fileIconBox,
                      file.riskLevel === 'danger' && styles.dangerFileIconBox,
                    ]}
                  >
                    <Ionicons
                      name={getFileIcon(file.type) as any}
                      size={22}
                      color={file.riskLevel === 'danger' ? Colors.danger : Colors.primary}
                    />
                  </View>

                  <View style={styles.fileMetaCol}>
                    <View style={styles.fileNameRow}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Badge label={file.riskLevel} type={getRiskBadgeType(file.riskLevel)} />
                    </View>
                    <Text style={styles.filePath} numberOfLines={1}>
                      {file.path}
                    </Text>
                    <View style={styles.fileDetailsRow}>
                      <Text style={styles.fileSizeText}>{formatFileSize(file.sizeKb)}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.fileDateText}>{file.modifiedDate}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Floating Bottom Scan Action Bar */}
      <View style={styles.floatingFooter}>
        <Button
          title={
            selectedFileIds.length > 0
              ? `Scan Selected Files (${selectedFileIds.length})`
              : `Scan Local Files (${files.length})`
          }
          onPress={() => startScan('files')}
          variant="primary"
          size="large"
          icon={<Ionicons name="scan-circle-outline" size={22} color="#0A0F1D" />}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  activeCatCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  catText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeCatText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  summaryCard: {
    marginBottom: 16,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.backgroundElevated,
  },
  clearBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  fileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectAllLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  fileCard: {
    padding: 12,
    marginBottom: 10,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerFileIconBox: {
    backgroundColor: Colors.dangerGlow,
  },
  fileMetaCol: {
    flex: 1,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  filePath: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileSizeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  fileDateText: {
    fontSize: 11,
    color: Colors.textMuted,
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
});
