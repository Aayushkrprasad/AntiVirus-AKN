export const Colors = {
  // Backgrounds
  backgroundPrimary: '#0A0F1D',    // Deep midnight dark blue
  backgroundSecondary: '#12192E',  // Card background
  backgroundElevated: '#1A233D',   // Modal/Elevated card background
  backgroundGlass: 'rgba(18, 25, 46, 0.85)',

  // Accents & Brand
  primary: '#00F0FF',              // Neon Cyan
  primaryGlow: 'rgba(0, 240, 255, 0.25)',
  secondary: '#3A86FF',            // Electric Blue
  accent: '#7000FF',               // Deep Cyber Violet

  // Status & Severity Colors
  safe: '#10B981',                 // Protected / Clean Green
  safeGlow: 'rgba(16, 185, 129, 0.25)',
  warning: '#F59E0B',              // Medium Threat / Caution Amber
  warningGlow: 'rgba(245, 158, 11, 0.25)',
  danger: '#EF4444',               // High Threat / Danger Red
  dangerGlow: 'rgba(239, 68, 68, 0.25)',
  info: '#3B82F6',                 // Informational

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textPrimaryGlow: '#E2E8F0',

  // Borders & Dividers
  border: '#1E293B',
  borderGlowing: '#00F0FF40',
  borderFocused: '#00F0FF',
  divider: '#1E293B',

  // Overlays
  overlay: 'rgba(5, 8, 15, 0.85)',
};

export type ColorType = keyof typeof Colors;
