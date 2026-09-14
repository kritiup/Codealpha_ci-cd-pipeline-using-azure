import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import { useNavigate } from 'react-router-dom';
import type { Deployment } from '../../types';
import { formatDateTime, formatDuration } from '../../utils/format';
import { monoFontStack } from '../../theme/createAppTheme';
import { StatusChip } from './StatusChip';
import { KeyValueList } from './KeyValueList';

interface DeploymentDetailsDialogProps {
  deployment: Deployment | null;
  onClose: () => void;
}

export function DeploymentDetailsDialog({ deployment, onClose }: DeploymentDetailsDialogProps) {
  const navigate = useNavigate();
  const runId = deployment ? deployment.buildNumber.replace('#', '') : '';

  return (
    <Dialog open={Boolean(deployment)} onClose={onClose} fullWidth maxWidth="sm">
      {deployment && (
        <>
          <DialogTitle sx={{ pr: 7 }}>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h6" component="span">
                Deployment {deployment.version}
              </Typography>
              <StatusChip status={deployment.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {deployment.environment} · {formatDateTime(deployment.deployedAt)}
            </Typography>
            <IconButton
              onClick={onClose}
              aria-label="Close"
              sx={{ position: 'absolute', right: 12, top: 12 }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <KeyValueList
              items={[
                { label: 'Version', value: deployment.version },
                { label: 'Environment', value: deployment.environment },
                { label: 'Status', value: <StatusChip status={deployment.status} /> },
                { label: 'Deployed by', value: deployment.deployedBy },
                { label: 'Deployed at', value: formatDateTime(deployment.deployedAt) },
                { label: 'Duration', value: formatDuration(deployment.durationSeconds) },
                { label: 'Source build', value: deployment.buildNumber },
                {
                  label: 'Image tag',
                  value: (
                    <Typography variant="body2" sx={{ fontFamily: monoFontStack, fontWeight: 600 }}>
                      {deployment.imageTag}
                    </Typography>
                  ),
                },
              ]}
            />
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Release notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deployment.notes}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<AccountTreeRoundedIcon />}
              onClick={() => {
                onClose();
                navigate(`/pipelines/${runId}`);
              }}
            >
              View build {deployment.buildNumber}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
