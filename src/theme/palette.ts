/** Sidebar keeps its own dark surface in both theme modes, as in the reference design. */
export const sidebarColors = {
  light: {
    background: '#0F172A',
    hover: 'rgba(148, 163, 184, 0.12)',
    activeBackground: 'rgba(37, 99, 235, 0.18)',
    activeBorder: '#3B82F6',
    text: '#CBD5E1',
    activeText: '#FFFFFF',
    muted: '#64748B',
    divider: 'rgba(148, 163, 184, 0.16)',
  },
  dark: {
    background: '#0A0F1C',
    hover: 'rgba(148, 163, 184, 0.10)',
    activeBackground: 'rgba(37, 99, 235, 0.22)',
    activeBorder: '#60A5FA',
    text: '#94A3B8',
    activeText: '#F8FAFC',
    muted: '#475569',
    divider: 'rgba(148, 163, 184, 0.12)',
  },
} as const;

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_COLLAPSED_WIDTH = 76;
export const TOPBAR_HEIGHT = 68;
