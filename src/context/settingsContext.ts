import { createContext } from 'react';
import type { DashboardSettings } from '../types/settings';

export interface SettingsContextValue {
  settings: DashboardSettings;
  /** Patch one or more preferences; persisted to localStorage. */
  updateSettings: (patch: Partial<DashboardSettings>) => void;
  resetSettings: () => void;
  /** Bumps whenever auto-refresh ticks or the user refreshes manually. */
  lastRefreshedAt: Date;
  refreshNow: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const defaultSettings: DashboardSettings = {
  themeMode: 'light',
  density: 'comfortable',
  autoRefresh: true,
  refreshIntervalSeconds: 30,
  rowsPerPage: 8,
  relativeTimestamps: true,
  defaultEnvironment: 'All',
  sidebarCollapsed: false,
};
