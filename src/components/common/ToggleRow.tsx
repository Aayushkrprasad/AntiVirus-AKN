import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface ToggleRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  subtitle,
  value,
  onValueChange,
  iconName,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {iconName && (
          <View style={styles.iconWrapper}>
            <Ionicons name={iconName} size={20} color={value ? Colors.primary : Colors.textMuted} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primaryGlow }}
        thumbColor={value ? Colors.primary : Colors.textSecondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
