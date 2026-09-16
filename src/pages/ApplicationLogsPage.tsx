import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { applicationLogs, createLiveLogEntry } from '../data/mockData';
import type { LogEntry, LogLevel, LogSource } from '../types';
import { ALL_LOG_LEVELS, LOG_SOURCE_LABELS, getLogLevelColor } from '../utils/status';
import { formatLogTimestamp } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { LogConsole } from '../components/ui/LogConsole';

type SourceFilter = LogSource | 'all';
type RangeFilter = '15m' | '1h' | '6h' | '24h' | 'all';

const sources: SourceFilter[] = ['all', 'pipeline', 'docker', 'acr', 'app-service', 'application'];

const ranges: { value: RangeFilter; label: string; minutes: number | null }[] = [
  { value: '15m', label: 'Last 15 minutes', minutes: 15 },
  { value: '1h', label: 'Last hour', minutes: 60 },
  { value: '6h', label: 'Last 6 hours', minutes: 360 },
  { value: '24h', label: 'Last 24 hours', minutes: 1440 },
  { value: 'all', label: 'All time', minutes: null },
];

export function ApplicationLogsPage() {
  const [search, setSearch] = useState('');
  const [levels, setLevels] = useState<LogLevel[]>([]);
  const [source, setSource] = useState<SourceFilter>('all');
  const [range, setRange] = useState<RangeFilter>('all');
  const [liveTail, setLiveTail] = useState(false);
  const [liveEntries, setLiveEntries] = useState<LogEntry[]>([]);
  const sequenceRef = useRef(0);

  // The clock lives in state so the time-range filter stays a pure computation.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!liveTail) return;
    const timer = window.setInterval(() => {
      sequenceRef.current += 1;
      setLiveEntries((current) =>
        [createLiveLogEntry(sequenceRef.current), ...current].slice(0, 60),
      );
    }, 2500);
    return () => window.clearInterval(timer);
  }, [liveTail]);

  const allEntries = useMemo(() => [...liveEntries, ...applicationLogs], [liveEntries]);

  const levelCounts = useMemo(() => {
    const counts: Record<LogLevel, number> = { INFO: 0, SUCCESS: 0, WARN: 0, ERROR: 0, DEBUG: 0 };
    allEntries.forEach((entry) => {
      counts[entry.level] += 1;
    });
    return counts;
  }, [allEntries]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rangeMinutes = ranges.find((item) => item.value === range)?.minutes ?? null;
    const cutoff = rangeMinutes === null ? null : now - rangeMinutes * 60_000;

    return allEntries.filter((entry) => {
      const matchesQuery = !query || entry.message.toLowerCase().includes(query);
      const matchesLevel = levels.length === 0 || levels.includes(entry.level);
      const matchesSource = source === 'all' || entry.source === source;
      const matchesRange = cutoff === null || new Date(entry.timestamp).getTime() >= cutoff;
      return matchesQuery && matchesLevel && matchesSource && matchesRange;
    });
  }, [allEntries, search, levels, source, range, now]);

  const hasActiveFilters =
    search !== '' || levels.length > 0 || source !== 'all' || range !== 'all';

  const clearFilters = useCallback(() => {
    setSearch('');
    setLevels([]);
    setSource('all');
    setRange('all');
  }, []);

  /** Exports exactly what is on screen as a plain-text log file. */
  const downloadVisibleLogs = useCallback(() => {
    const text = filtered
      .map(
        (entry) =>
          `${formatLogTimestamp(entry.timestamp)}  ${entry.level.padEnd(7)} [${entry.source}] ${entry.message}`,
      )
      .join('\n');

    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `application-logs-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <Box>
      <PageHeader
        title="Application Logs"
        description="Combined pipeline, container registry, App Service and runtime output for this service."
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant={liveTail ? 'contained' : 'outlined'}
              color={liveTail ? 'error' : 'inherit'}
              startIcon={liveTail ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setLiveTail((value) => !value)}
            >
              {liveTail ? 'Pause live tail' : 'Start live tail'}
            </Button>
            <Tooltip title="Download the entries currently shown">
              <span>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={downloadVisibleLogs}
                  disabled={filtered.length === 0}
                >
                  Export
                </Button>
              </span>
            </Tooltip>
          </Stack>
        }
      />

      <Card>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              placeholder="Search log messages…"
              sx={{ flexGrow: 1, minWidth: { md: 240 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Source"
              value={source}
              onChange={(event) => setSource(event.target.value as SourceFilter)}
              sx={{ minWidth: 190 }}
            >
              {sources.map((value) => (
                <MenuItem key={value} value={value}>
                  {value === 'all' ? 'All sources' : LOG_SOURCE_LABELS[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Time range"
              value={range}
              onChange={(event) => setRange(event.target.value as RangeFilter)}
              sx={{ minWidth: 175 }}
            >
              {ranges.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                color="inherit"
                startIcon={<FilterAltOffRoundedIcon />}
                sx={{ flexShrink: 0 }}
              >
                Clear
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={2}

            useFlexGap
            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mt: 2 }}
          >
            <ToggleButtonGroup
              value={levels}
              onChange={(_event, next: LogLevel[]) => setLevels(next)}
              size="small"
              aria-label="Filter by log level"
              sx={{ flexWrap: 'wrap' }}
            >
              {ALL_LOG_LEVELS.map((level) => {
                const color = getLogLevelColor(level);
                return (
                  <ToggleButton
                    key={level}
                    value={level}
                    sx={(theme) => ({
                      px: 1.5,
                      gap: 0.75,
                      fontSize: 12,
                      '&.Mui-selected': {
                        color:
                          color === 'default'
                            ? theme.palette.text.primary
                            : theme.palette[color].main,
                        backgroundColor:
                          color === 'default'
                            ? theme.palette.action.selected
                            : `color-mix(in srgb, ${theme.palette[color].main} 14%, transparent)`,
                      },
                    })}
                  >
                    <CircleRoundedIcon
                      sx={(theme) => ({
                        fontSize: 8,
                        color:
                          color === 'default'
                            ? theme.palette.text.disabled
                            : theme.palette[color].main,
                      })}
                    />
                    {level}
                    <Box component="span" sx={{ opacity: 0.6 }}>
                      {levelCounts[level]}
                    </Box>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {liveTail && (
                <Chip
                  size="small"
                  icon={
                    <CircleRoundedIcon
                      sx={{
                        fontSize: '9px !important',
                        animation: 'live-pulse 1.4s ease-in-out infinite',
                        '@keyframes live-pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.25 },
                        },
                      }}
                    />
                  }
                  label="Live"
                  color="error"
                  variant="outlined"
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {filtered.length} of {allEntries.length} entries
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider />
        <LogConsole
          entries={filtered}
          highlight={search}
          maxHeight="calc(100vh - 400px)"
          emptyMessage="No log entries match the current filters. Try widening the time range or clearing filters."
        />
      </Card>
    </Box>
  );
}
