import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'glass':
        return styles.glassContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      case 'outline':
        return styles.outlineText;
      case 'glass':
        return styles.glassText;
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return { container: styles.sizeSmall, text: styles.textSmall };
      case 'large':
        return { container: styles.sizeLarge, text: styles.textLarge };
      default:
        return { container: styles.sizeMedium, text: styles.textMedium };
    }
  };

  const sizeStyles = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getContainerStyle(),
        sizeStyles.container,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0A0F1D' : Colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.baseText, getTextStyle(), sizeStyles.text, icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  baseText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Sizes
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sizeMedium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sizeLarge: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  textSmall: {
    fontSize: 13,
  },
  textMedium: {
    fontSize: 15,
  },
  textLarge: {
    fontSize: 17,
  },
  // Variants
  primaryContainer: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryText: {
    color: '#0A0F1D',
  },
  secondaryContainer: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  dangerContainer: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dangerText: {
    color: Colors.textPrimary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  glassContainer: {
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  glassText: {
    color: Colors.textPrimary,
  },
  disabledContainer: {
    opacity: 0.5,
  },
});
