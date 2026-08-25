import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface BadgeProps {
  label: string;
  type?: 'safe' | 'warning' | 'danger' | 'info' | 'primary';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, type = 'info', style }) => {
  const getBadgeColors = () => {
    switch (type) {
      case 'safe':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: Colors.safe, border: 'rgba(16, 185, 129, 0.4)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: Colors.warning, border: 'rgba(245, 158, 11, 0.4)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: Colors.danger, border: 'rgba(239, 68, 68, 0.4)' };
      case 'primary':
        return { bg: 'rgba(0, 240, 255, 0.15)', text: Colors.primary, border: 'rgba(0, 240, 255, 0.4)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: Colors.info, border: 'rgba(59, 130, 246, 0.4)' };
    }
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
