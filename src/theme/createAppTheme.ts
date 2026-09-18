import { createTheme, type Theme } from '@mui/material/styles';
import type { Density, ThemeMode } from '../types/settings';

const fontStack = [
  '"Inter"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

export const monoFontStack = [
  '"JetBrains Mono"',
  '"SFMono-Regular"',
  'Menlo',
  'Consolas',
  '"Liberation Mono"',
  'monospace',
].join(',');

export function createAppTheme(mode: ThemeMode, density: Density): Theme {
  const isLight = mode === 'light';
  const compact = density === 'compact';

  return createTheme({
    palette: {
      mode,
      primary: { main: isLight ? '#2563EB' : '#60A5FA', contrastText: '#FFFFFF' },
      secondary: { main: '#7C3AED' },
      success: { main: isLight ? '#16A34A' : '#4ADE80' },
      error: { main: isLight ? '#DC2626' : '#F87171' },
      warning: { main: isLight ? '#D97706' : '#FBBF24' },
      info: { main: isLight ? '#0EA5E9' : '#38BDF8' },
      background: {
        default: isLight ? '#F4F6FB' : '#0B1120',
        paper: isLight ? '#FFFFFF' : '#111827',
      },
      text: {
        primary: isLight ? '#0F172A' : '#F1F5F9',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      divider: isLight ? '#E2E8F0' : 'rgba(148, 163, 184, 0.18)',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: fontStack,
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isLight ? '#CBD5E1' : '#334155',
            borderRadius: 8,
            border: `2px solid ${isLight ? '#F4F6FB' : '#0B1120'}`,
          },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isLight ? '#E6EAF2' : 'rgba(148, 163, 184, 0.16)'}`,
            boxShadow: isLight
              ? '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -16px rgba(15, 23, 42, 0.20)'
              : '0 1px 2px rgba(0, 0, 0, 0.4)',
            transition: 'box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: compact ? 16 : 22,
            '&:last-child': { paddingBottom: compact ? 16 : 22 },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
          sizeSmall: { height: 24 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingBlock: compact ? 8 : 14,
            borderBottomColor: isLight ? '#EEF1F7' : 'rgba(148, 163, 184, 0.12)',
          },
          head: {
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isLight ? '#64748B' : '#94A3B8',
            backgroundColor: isLight ? '#F8FAFC' : 'rgba(148, 163, 184, 0.06)',
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': {
              backgroundColor: isLight ? 'rgba(37, 99, 235, 0.045)' : 'rgba(96, 165, 250, 0.08)',
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: { tooltip: { fontSize: 12, borderRadius: 8, paddingBlock: 6 } },
      },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiListItemButton: { styleOverrides: { root: { borderRadius: 10 } } },
    },
  });
}
