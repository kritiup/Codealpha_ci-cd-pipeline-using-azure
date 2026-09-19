/** Formatting helpers shared across pages. */

/** `1h 24m 05s`-style duration, trimmed to the largest meaningful unit. */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Millisecond-precision stamp used by the log console. */
export function formatLogTimestamp(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number, size = 2) => String(value).padStart(size, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    `${pad(date.getMilliseconds(), 3)}`
  );
}

/**
 * `just now` / `12m ago` / `3d ago`, falling back to a date past a week.
 * `now` is passed in so callers can recompute against a refresh tick.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const deltaSeconds = (now - new Date(iso).getTime()) / 1000;
  if (deltaSeconds < 60) return 'just now';

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
  });
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}
