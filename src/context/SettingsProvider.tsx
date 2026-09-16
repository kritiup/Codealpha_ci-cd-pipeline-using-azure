import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DashboardSettings } from '../types/settings';
import { SettingsContext, defaultSettings, type SettingsContextValue } from './settingsContext';

const STORAGE_KEY = 'devops-dashboard-settings';

function loadSettings(): DashboardSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    // Merge so a stored payload from an older shape still boots cleanly.
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<DashboardSettings>) };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DashboardSettings>(loadSettings);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(() => new Date());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage can be unavailable (private mode); preferences stay in memory.
    }
  }, [settings]);

  useEffect(() => {
    if (!settings.autoRefresh) return;
    const timer = window.setInterval(
      () => setLastRefreshedAt(new Date()),
      settings.refreshIntervalSeconds * 1000,
    );
    return () => window.clearInterval(timer);
  }, [settings.autoRefresh, settings.refreshIntervalSeconds]);

  const updateSettings = useCallback((patch: Partial<DashboardSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const resetSettings = useCallback(() => setSettings(defaultSettings), []);
  const refreshNow = useCallback(() => setLastRefreshedAt(new Date()), []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, resetSettings, lastRefreshedAt, refreshNow }),
    [settings, updateSettings, resetSettings, lastRefreshedAt, refreshNow],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
