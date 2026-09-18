import type { EnvironmentName } from './index';

export type ThemeMode = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type EnvironmentFilter = EnvironmentName | 'All';

/** Persisted dashboard preferences — every field visibly changes the UI. */
export interface DashboardSettings {
  themeMode: ThemeMode;
  density: Density;
  /** Re-runs the "last updated" clock and refreshes relative timestamps. */
  autoRefresh: boolean;
  refreshIntervalSeconds: number;
  rowsPerPage: number;
  /** Show "12m ago" instead of an absolute date across tables. */
  relativeTimestamps: boolean;
  /** Pre-selects the environment filter on Pipeline Runs and Deployment History. */
  defaultEnvironment: EnvironmentFilter;
  sidebarCollapsed: boolean;
}
