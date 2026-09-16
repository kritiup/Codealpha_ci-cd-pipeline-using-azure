import Chip from '@mui/material/Chip';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import type { RunStatus } from '../../types';
import { getStatusVisual } from '../../utils/status';

const statusIcons: Record<RunStatus, typeof CheckCircleRoundedIcon> = {
  succeeded: CheckCircleRoundedIcon,
  failed: ErrorRoundedIcon,
  running: AutorenewRoundedIcon,
  queued: ScheduleRoundedIcon,
  canceled: DoDisturbOnRoundedIcon,
  skipped: RemoveCircleRoundedIcon,
};

interface StatusChipProps {
  status: RunStatus;
  size?: 'small' | 'medium';
}

/** Colour-coded status badge; the running state spins so live work reads as live. */
export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const { label, color } = getStatusVisual(status);
  const Icon = statusIcons[status];

  return (
    <Chip
      size={size}
      label={label}
      variant="outlined"
      icon={
        <Icon
          sx={{
            fontSize: 16,
            ...(status === 'running' && {
              animation: 'status-spin 1.4s linear infinite',
              '@keyframes status-spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }),
          }}
        />
      }
      sx={(theme) => {
        const main = color === 'default' ? theme.palette.text.secondary : theme.palette[color].main;
        return {
          color: main,
          borderColor: 'transparent',
          backgroundColor: `color-mix(in srgb, ${main} 12%, transparent)`,
          '& .MuiChip-icon': { color: main, marginLeft: '6px' },
        };
      }}
    />
  );
}
