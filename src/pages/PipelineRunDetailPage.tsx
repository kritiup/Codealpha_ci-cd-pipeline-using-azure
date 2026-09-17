import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { applicationLogs, deployments, pipelineRuns } from '../data/mockData';
import { formatDateTime, formatDuration, formatTime } from '../utils/format';
import { getStatusVisual } from '../utils/status';
import { monoFontStack } from '../theme/createAppTheme';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusChip } from '../components/ui/StatusChip';
import { PipelineStageTrack } from '../components/ui/PipelineStageTrack';
import { KeyValueList } from '../components/ui/KeyValueList';
import { LogConsole } from '../components/ui/LogConsole';
import { EmptyState } from '../components/ui/EmptyState';

export function PipelineRunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const index = pipelineRuns.findIndex((item) => item.id === runId);
  const run = index >= 0 ? pipelineRuns[index] : undefined;

  // Runs are ordered newest first, so "newer" sits at the lower index.
  const newerRun = index > 0 ? pipelineRuns[index - 1] : undefined;
  const olderRun =
    index >= 0 && index < pipelineRuns.length - 1 ? pipelineRuns[index + 1] : undefined;

  const relatedDeployment = useMemo(
    () => deployments.find((deployment) => deployment.buildNumber === run?.buildNumber),
    [run],
  );

  // A believable slice of the log stream to stand in for this run's output.
  const runLogs = useMemo(() => applicationLogs.slice(0, 22), []);

  if (!run) {
    return (
      <Box>
        <PageHeader title="Pipeline run not found" />
        <EmptyState
          title={`No pipeline run with id "${runId ?? ''}"`}
          description="The run may have been removed from retention."
          action={
            <Button variant="contained" component={RouterLink} to="/pipelines">
              Back to pipeline runs
            </Button>
          }
        />
      </Box>
    );
  }

  const completedStages = run.stages.filter((stage) => stage.status === 'succeeded').length;
  const failedStage = run.stages.find((stage) => stage.status === 'failed');

  return (
    <Box>
      <PageHeader
        title={`Build ${run.buildNumber}`}
        description={run.commitMessage}
        breadcrumb={
          <Breadcrumbs separator="/" sx={{ fontSize: 14 }}>
            <Link component={RouterLink} to="/pipelines" underline="hover" color="inherit">
              Pipeline Runs
            </Link>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {run.buildNumber}
            </Typography>
          </Breadcrumbs>
        }
        action={
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              disabled={!olderRun}
              onClick={() => olderRun && navigate(`/pipelines/${olderRun.id}`)}
            >
              Older
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon />}
              disabled={!newerRun}
              onClick={() => newerRun && navigate(`/pipelines/${newerRun.id}`)}
            >
              Newer
            </Button>
            <Button variant="contained" component={RouterLink} to="/pipelines">
              All runs
            </Button>
          </Stack>
        }
      />

      {failedStage && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          <AlertTitle>Stage &ldquo;{failedStage.name}&rdquo; failed</AlertTitle>
          {failedStage.summary}
        </Alert>
      )}

      {run.status === 'running' && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
          <AlertTitle>Run in progress</AlertTitle>
          {completedStages} of {run.stages.length} stages have completed. This view updates as the
          pipeline advances.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          mb: 2.5,
        }}
      >
        <StatCard
          label="Run status"
          value={getStatusVisual(run.status).label}
          caption={`Triggered by ${run.trigger}`}
          icon={<BoltRoundedIcon />}
          color={getStatusVisual(run.status).color}
        />
        <StatCard
          label="Total duration"
          value={formatDuration(run.durationSeconds)}
          caption={`Started ${formatTime(run.startedAt)}`}
          icon={<TimerRoundedIcon />}
          color="info"
        />
        <StatCard
          label="Stages completed"
          value={`${completedStages} / ${run.stages.length}`}
          caption="Code Build → Deploy to App Service"
          icon={<LayersRoundedIcon />}
          color="primary"
        />
        <StatCard
          label="Target environment"
          value={run.environment}
          caption={`Branch ${run.branch}`}
          icon={<DnsRoundedIcon />}
          color="warning"
        />
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <SectionCard
          title="Pipeline stages"
          subtitle="Each stage in execution order, with its outcome and duration"
          action={<StatusChip status={run.status} size="medium" />}
        >
          <PipelineStageTrack stages={run.stages} showSummaries />
        </SectionCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
          mb: 2.5,
        }}
      >
        <SectionCard title="Stage timeline" disableContentPadding>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 620 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Stage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {run.stages.map((stage) => (
                  <TableRow key={stage.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stage.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stage.summary}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={stage.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {stage.startedAt ? formatTime(stage.startedAt) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(stage.durationSeconds)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>

        <SectionCard title="Run details">
          <KeyValueList
            items={[
              { label: 'Build number', value: run.buildNumber },
              { label: 'Status', value: <StatusChip status={run.status} /> },
              { label: 'Branch', value: run.branch },
              {
                label: 'Commit',
                value: (
                  <Typography variant="body2" sx={{ fontFamily: monoFontStack, fontWeight: 600 }}>
                    {run.commitSha.slice(0, 12)}
                  </Typography>
                ),
              },
              { label: 'Triggered by', value: run.triggeredBy },
              {
                label: 'Trigger',
                value: <Chip size="small" variant="outlined" label={run.trigger} />,
              },
              { label: 'Environment', value: run.environment },
              { label: 'Started at', value: formatDateTime(run.startedAt) },
              { label: 'Duration', value: formatDuration(run.durationSeconds) },
            ]}
          />

          {relatedDeployment && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RocketLaunchRoundedIcon />}
              component={RouterLink}
              to={`/deployments?q=${encodeURIComponent(relatedDeployment.version)}`}
              sx={{ mt: 2.5 }}
            >
              View deployment {relatedDeployment.version}
            </Button>
          )}
        </SectionCard>
      </Box>

      <SectionCard
        title="Run output"
        subtitle="Console output captured by the build agent"
        disableContentPadding
      >
        <LogConsole entries={runLogs} maxHeight={420} />
      </SectionCard>
    </Box>
  );
}
