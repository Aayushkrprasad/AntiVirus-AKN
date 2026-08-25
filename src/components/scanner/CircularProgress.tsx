import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface CircularProgressProps {
  progressPercent: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  statusText?: string;
  isComplete?: boolean;
  hasThreats?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progressPercent,
  size = 220,
  strokeWidth = 14,
  statusText = 'Scanning...',
  isComplete = false,
  hasThreats = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, progressPercent))) / 100;

  const getStatusColor = () => {
    if (isComplete) {
      return hasThreats ? Colors.danger : Colors.safe;
    }
    return Colors.primary;
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={hasThreats ? Colors.danger : Colors.primary} />
            <Stop offset="100%" stopColor={hasThreats ? Colors.warning : Colors.secondary} />
          </LinearGradient>
        </Defs>
        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.backgroundElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scanGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.innerContent}>
        <Ionicons
          name={
            isComplete
              ? hasThreats
                ? 'warning'
                : 'shield-checkmark'
              : 'shield'
          }
          size={42}
          color={statusColor}
          style={styles.icon}
        />
        <Text style={[styles.percentText, { color: statusColor }]}>{progressPercent}%</Text>
        <Text style={styles.statusLabel}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  svg: {
    position: 'absolute',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  percentText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});
