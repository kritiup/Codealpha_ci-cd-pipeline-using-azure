import type { LogLevel, RunStatus } from '../types';

export type StatusColor = 'success' | 'error' | 'info' | 'warning' | 'default';

export interface StatusVisual {
  label: string;
  color: StatusColor;
}

const statusVisuals: Record<RunStatus, StatusVisual> = {
  succeeded: { label: 'Succeeded', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  running: { label: 'Running', color: 'info' },
  queued: { label: 'Queued', color: 'default' },
  canceled: { label: 'Canceled', color: 'warning' },
  skipped: { label: 'Skipped', color: 'default' },
};

export function getStatusVisual(status: RunStatus): StatusVisual {
  return statusVisuals[status];
}

export const ALL_RUN_STATUSES: RunStatus[] = [
  'succeeded',
  'failed',
  'running',
  'queued',
  'canceled',
  'skipped',
];

const logLevelColors: Record<LogLevel, StatusColor> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARN: 'warning',
  ERROR: 'error',
  DEBUG: 'default',
};

export function getLogLevelColor(level: LogLevel): StatusColor {
  return logLevelColors[level];
}

export const ALL_LOG_LEVELS: LogLevel[] = ['INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG'];

export const LOG_SOURCE_LABELS: Record<string, string> = {
  pipeline: 'Pipeline',
  docker: 'Docker',
  acr: 'Container Registry',
  'app-service': 'App Service',
  application: 'Application',
};
