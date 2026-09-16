import { useContext } from 'react';
import { SettingsContext, type SettingsContextValue } from '../context/settingsContext';

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a <SettingsProvider>');
  }
  return context;
}
