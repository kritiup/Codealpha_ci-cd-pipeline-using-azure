import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import type { PipelineStage } from '../../types';
import { getStatusVisual } from '../../utils/status';

/** Compact four-dot summary of the pipeline stages, for table rows. */
export function StageDots({ stages }: { stages: PipelineStage[] }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      {stages.map((stage) => {
        const { label, color } = getStatusVisual(stage.status);
        return (
          <Tooltip key={stage.id} title={`${stage.name}: ${label}`}>
            <Box
              sx={(theme) => ({
                width: 22,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  color === 'default' ? theme.palette.action.disabled : theme.palette[color].main,
                opacity: stage.status === 'queued' || stage.status === 'skipped' ? 0.45 : 1,
              })}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}
