import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import type { PipelineStage, RunStatus } from '../../types';
import { formatDuration } from '../../utils/format';
import { getStatusVisual } from '../../utils/status';

const stageIcons: Record<RunStatus, typeof CheckRoundedIcon> = {
  succeeded: CheckRoundedIcon,
  failed: CloseRoundedIcon,
  running: AutorenewRoundedIcon,
  queued: ScheduleRoundedIcon,
  canceled: CloseRoundedIcon,
  skipped: RemoveRoundedIcon,
};

interface PipelineStageTrackProps {
  stages: PipelineStage[];
  /** Adds the per-stage summary line under each node. */
  showSummaries?: boolean;
}

/**
 * Code Build → Docker Build → Push to ACR → Deploy to App Service.
 * Flows left-to-right on desktop and stacks vertically on narrow screens.
 */
export function PipelineStageTrack({ stages, showSummaries = false }: PipelineStageTrackProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={0}

      sx={{ alignItems: 'stretch', width: '100%' }}
    >
      {stages.map((stage, index) => {
        const { label, color } = getStatusVisual(stage.status);
        const Icon = stageIcons[stage.status];
        const isMuted = stage.status === 'queued' || stage.status === 'skipped';

        return (
          <Box
            key={stage.id}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: { xs: 'stretch', lg: 'center' },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={(theme) => {
                const main =
                  color === 'default' ? theme.palette.text.secondary : theme.palette[color].main;
                return {
                  flex: 1,
                  minWidth: 0,
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: isMuted ? 'divider' : `color-mix(in srgb, ${main} 32%, transparent)`,
                  backgroundColor: isMuted
                    ? 'transparent'
                    : `color-mix(in srgb, ${main} 7%, transparent)`,
                  opacity: isMuted ? 0.7 : 1,
                  transition: 'transform 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px -18px rgba(15, 23, 42, 0.6)',
                  },
                };
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={(theme) => {
                    const main =
                      color === 'default'
                        ? theme.palette.text.secondary
                        : theme.palette[color].main;
                    return {
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      color: theme.palette.getContrastText(main),
                      backgroundColor: main,
                      '& svg': {
                        fontSize: 18,
                        ...(stage.status === 'running' && {
                          animation: 'stage-spin 1.4s linear infinite',
                          '@keyframes stage-spin': {
                            from: { transform: 'rotate(0deg)' },
                            to: { transform: 'rotate(360deg)' },
                          },
                        }),
                      },
                    };
                  }}
                >
                  <Icon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap title={stage.name}>
                    {stage.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                    {stage.durationSeconds > 0 && ` · ${formatDuration(stage.durationSeconds)}`}
                  </Typography>
                </Box>
              </Stack>

              {stage.status === 'running' && (
                <LinearProgress sx={{ mt: 1.5, height: 5, borderRadius: 3 }} />
              )}

              {showSummaries && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                  {stage.summary}
                </Typography>
              )}
            </Box>

            {index < stages.length - 1 && (
              <Box
                aria-hidden
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  color: 'text.disabled',
                  px: { xs: 0, lg: 0.5 },
                  py: { xs: 0.25, lg: 0 },
                  transform: { xs: 'rotate(90deg)', lg: 'none' },
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
