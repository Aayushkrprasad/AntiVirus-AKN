import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useScanner } from '../context/ScannerContext';

export const PasswordVaultScreen: React.FC = () => {
  const { passwords, addPasswordCredential, deletePasswordCredential } = useScanner();

  const [modalVisible, setModalVisible] = useState(false);
  const [siteInput, setSiteInput] = useState('');
  const [userInput, setUserInput] = useState('');

  const handleAddCredential = async () => {
    if (!siteInput.trim() || !userInput.trim()) {
      Alert.alert('Validation Error', 'Please enter both the website/app name and username/email.');
      return;
    }
    await addPasswordCredential(siteInput.trim(), userInput.trim());
    setSiteInput('');
    setUserInput('');
    setModalVisible(false);
  };

  const handleDelete = (id: string, site: string) => {
    Alert.alert('Confirm Removal', `Delete stored credential for ${site}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePasswordCredential(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Password & Identity Vault" subtitle="Zero-knowledge local credential storage" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Security Overview Hero */}
        <Card glowingBorder style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconBox}>
              <Ionicons name="key-outline" size={28} color={Colors.primary} />
            </View>
            <View style={styles.heroInfo}>
              <Badge label="Local Storage Only" type="safe" />
              <Text style={styles.heroTitle}>Encrypted Password Vault</Text>
              <Text style={styles.heroDesc}>
                {passwords.length === 0
                  ? 'No credentials currently stored on this device.'
                  : `${passwords.length} credential${passwords.length === 1 ? '' : 's'} stored locally.`}
              </Text>
            </View>
          </View>
        </Card>

        {/* Credentials Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stored Credentials ({passwords.length})</Text>
          <Button
            title="+ Add Credential"
            onPress={() => setModalVisible(true)}
            variant="outline"
            size="small"
          />
        </View>

        {passwords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="shield-checkmark-outline" size={38} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Credentials Saved</Text>
            <Text style={styles.emptyDesc}>
              Store your website logins locally on this device. Data is persisted securely in local storage and is never uploaded.
            </Text>
          </Card>
        ) : (
          passwords.map((item) => (
            <Card key={item.id} style={styles.passCard}>
              <View style={styles.passRow}>
                <View style={styles.passIconBox}>
                  <Ionicons name="key" size={20} color={Colors.primary} />
                </View>

                <View style={styles.passMeta}>
                  <View style={styles.passTitleRow}>
                    <Text style={styles.passSite}>{item.site}</Text>
                    <Badge label="Local" type="safe" />
                  </View>
                  <Text style={styles.passEmail}>{item.usernameOrEmail}</Text>
                  <Text style={styles.passDots}>••••••••••••••••</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.site)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Credential Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Local Credential</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Website / Service Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GitHub, Google, Work Portal"
              placeholderTextColor={Colors.textMuted}
              value={siteInput}
              onChangeText={setSiteInput}
            />

            <Text style={styles.inputLabel}>Username / Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. user@domain.com"
              placeholderTextColor={Colors.textMuted}
              value={userInput}
              onChangeText={setUserInput}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="glass"
                size="medium"
              />
              <Button
                title="Save Credential"
                onPress={handleAddCredential}
                variant="primary"
                size="medium"
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  heroCard: {
    marginBottom: 16,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    lineHeight: 18,
  },
  passCard: {
    padding: 14,
    marginBottom: 10,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passMeta: {
    flex: 1,
  },
  passTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  passSite: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  passEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  passDots: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.backgroundElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
});
