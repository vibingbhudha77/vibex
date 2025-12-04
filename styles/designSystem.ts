
export const COLORS = {
  light: {
    bgPrimary: '#FAFAFA',
    bgSecondary: '#F0F2F5',
    bgTertiary: '#FFFFFF',
    bgElevated: '#FFFFFF',
    
    textPrimary: '#1A1A1A',
    textSecondary: '#737373',
    textTertiary: '#A3A3A3',
    
    accentPrimary: '#16A34A', // Green 600
    accentPrimaryHover: '#15803D', // Green 700
    accentSecondary: '#8B5CF6', // Violet 500
    
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.15)',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    bgPrimary: '#0A0A0A',
    bgSecondary: '#1A1A1A',
    bgTertiary: '#262626',
    bgElevated: '#1F1F1F',
    
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    
    accentPrimary: '#22C55E', // Green 500
    accentPrimaryHover: '#16A34A', // Green 600
    accentSecondary: '#A78BFA', // Violet 400
    
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const RADIUS = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)',
};

export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};
