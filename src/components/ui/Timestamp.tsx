import { useMemo } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { useSettings } from '../../hooks/useSettings';
import { formatDateTime, formatRelativeTime } from '../../utils/format';

interface TimestampProps {
  value: string;
  /** `inherit` lets a surrounding heading own the type scale. */
  variant?: TypographyProps['variant'];
  color?: string;
}

/**
 * Renders a timestamp in whichever style the user picked in Settings and shows
 * the other form on hover, so no information is lost either way.
 */
export function Timestamp({ value, variant = 'body2', color = 'text.primary' }: TimestampProps) {
  const { settings, lastRefreshedAt } = useSettings();

  // Measured against the refresh clock, so relative labels stay honest as it ticks.
  const { relative, absolute } = useMemo(
    () => ({
      relative: formatRelativeTime(value, lastRefreshedAt.getTime()),
      absolute: formatDateTime(value),
    }),
    [value, lastRefreshedAt],
  );
  const primary = settings.relativeTimestamps ? relative : absolute;
  const secondary = settings.relativeTimestamps ? absolute : relative;

  return (
    <Tooltip title={secondary}>
      <Typography variant={variant} color={color} component="span" sx={{ whiteSpace: 'nowrap' }}>
        {primary}
      </Typography>
    </Tooltip>
  );
}
