import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useScanner } from '../../context/ScannerContext';

export const BottomNavBar: React.FC = () => {
  const { navState, setActiveTab } = useScanner();
  const currentTab = navState.activeTab;

  const tabs: Array<{ id: 'Security' | 'Password' | 'Profile'; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'Security', label: 'Security', icon: 'shield-outline', activeIcon: 'shield' },
    { id: 'Password', label: 'Password', icon: 'lock-closed-outline', activeIcon: 'lock-closed' },
    { id: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 68,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeTabButton: {},
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  activeIconWrapper: {
    backgroundColor: Colors.primaryGlow,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
