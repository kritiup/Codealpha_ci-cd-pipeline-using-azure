import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { LogEntry } from '../../types';
import { formatLogTimestamp } from '../../utils/format';
import { LOG_SOURCE_LABELS, getLogLevelColor } from '../../utils/status';
import { monoFontStack } from '../../theme/createAppTheme';

interface LogConsoleProps {
  entries: LogEntry[];
  maxHeight?: number | string;
  /** Substring to highlight, used by the log search box. */
  highlight?: string;
  emptyMessage?: string;
}

function highlightMessage(message: string, term: string) {
  const query = term.trim();
  if (!query) return message;

  const index = message.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return message;

  return (
    <>
      {message.slice(0, index)}
      <Box
        component="mark"
        sx={{
          backgroundColor: 'warning.main',
          color: 'common.black',
          borderRadius: 0.5,
          px: 0.25,
        }}
      >
        {message.slice(index, index + query.length)}
      </Box>
      {message.slice(index + query.length)}
    </>
  );
}

/** Terminal-styled log viewer shared by the logs page and the run detail page. */
export function LogConsole({
  entries,
  maxHeight = 520,
  highlight = '',
  emptyMessage = 'No log entries match the current filters.',
}: LogConsoleProps) {
  return (
    <Box
      sx={(theme) => ({
        maxHeight,
        overflow: 'auto',
        backgroundColor: theme.palette.mode === 'light' ? '#0F172A' : '#080C16',
        fontFamily: monoFontStack,
        fontSize: 12.5,
        lineHeight: 1.7,
        py: 1,
      })}
    >
      {entries.length === 0 ? (
        <Typography
          sx={{ color: '#64748B', px: 2, py: 3, fontFamily: monoFontStack, fontSize: 13 }}
        >
          {emptyMessage}
        </Typography>
      ) : (
        entries.map((entry) => {
          const color = getLogLevelColor(entry.level);
          return (
            <Box
              key={entry.id}
              sx={(theme) => ({
                display: 'flex',
                gap: 1.5,
                px: 2,
                py: 0.35,
                alignItems: 'baseline',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                transition: 'background-color 120ms ease',
                '&:hover': { backgroundColor: 'rgba(148, 163, 184, 0.10)' },
                borderLeft: '2px solid transparent',
                ...((entry.level === 'ERROR' || entry.level === 'WARN') && {
                  borderLeftColor: color === 'default' ? 'transparent' : theme.palette[color].main,
                  backgroundColor: `color-mix(in srgb, ${
                    color === 'default' ? 'transparent' : theme.palette[color].main
                  } 10%, transparent)`,
                }),
              })}
            >
              <Box component="span" sx={{ color: '#64748B', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {formatLogTimestamp(entry.timestamp)}
              </Box>
              <Box
                component="span"
                sx={(theme) => ({
                  flexShrink: 0,
                  width: 62,
                  fontWeight: 700,
                  color: color === 'default' ? '#94A3B8' : theme.palette[color].main,
                })}
              >
                {entry.level}
              </Box>
              <Box
                component="span"
                sx={{
                  flexShrink: 0,
                  width: 168,
                  color: '#7DD3FC',
                  whiteSpace: 'nowrap',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                [{LOG_SOURCE_LABELS[entry.source] ?? entry.source}]
              </Box>
              <Box component="span" sx={{ color: '#E2E8F0', minWidth: 0, wordBreak: 'break-word' }}>
                {highlightMessage(entry.message, highlight)}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}
