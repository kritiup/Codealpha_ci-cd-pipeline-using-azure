import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import type { Deployment } from '../../types';
import { formatDuration } from '../../utils/format';
import { monoFontStack } from '../../theme/createAppTheme';
import { StatusChip } from './StatusChip';
import { Timestamp } from './Timestamp';

interface DeploymentsTableProps {
  deployments: Deployment[];
  onSelect: (deployment: Deployment) => void;
  /** The dashboard shows a trimmed version of this table. */
  showExtraColumns?: boolean;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function DeploymentsTable({
  deployments,
  onSelect,
  showExtraColumns = true,
}: DeploymentsTableProps) {
  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: showExtraColumns ? 860 : 620 }}>
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Environment</TableCell>
            <TableCell>Deployment time</TableCell>
            {showExtraColumns && <TableCell>Duration</TableCell>}
            {showExtraColumns && <TableCell>Build</TableCell>}
            <TableCell>Deployed by</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow
              key={deployment.id}
              hover
              onClick={() => onSelect(deployment)}
              tabIndex={0}
              role="button"
              aria-label={`View deployment ${deployment.version}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(deployment);
                }
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: monoFontStack }}>
                  {deployment.version}
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip status={deployment.status} />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={deployment.environment}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Timestamp value={deployment.deployedAt} />
              </TableCell>
              {showExtraColumns && (
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(deployment.durationSeconds)}
                  </Typography>
                </TableCell>
              )}
              {showExtraColumns && (
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: monoFontStack }}
                  >
                    {deployment.buildNumber}
                  </Typography>
                </TableCell>
              )}
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: 11, fontWeight: 700 }}>
                    {initials(deployment.deployedBy)}
                  </Avatar>
                  <Typography variant="body2" noWrap>
                    {deployment.deployedBy}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
