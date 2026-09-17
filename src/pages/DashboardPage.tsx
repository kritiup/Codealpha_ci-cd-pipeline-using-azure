import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import CommitRoundedIcon from '@mui/icons-material/CommitRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  applicationInfo,
  dashboardMetrics,
  deployments,
  pipelineRuns,
  techStack,
} from '../data/mockData';
import type { Deployment, TechStackItem } from '../types';
import { formatDuration, shortSha } from '../utils/format';
import { monoFontStack } from '../theme/createAppTheme';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusChip } from '../components/ui/StatusChip';
import { PipelineStageTrack } from '../components/ui/PipelineStageTrack';
import { KeyValueList } from '../components/ui/KeyValueList';
import { Timestamp } from '../components/ui/Timestamp';
import { DeploymentsTable } from '../components/ui/DeploymentsTable';
import { DeploymentDetailsDialog } from '../components/ui/DeploymentDetailsDialog';

const stackCategories: TechStackItem['category'][] = [
  'Frontend',
  'Backend',
  'Infrastructure',
  'CI/CD',
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  const latestRun = pipelineRuns[0];
  const lastSuccessfulDeployment = useMemo(
    () => deployments.find((deployment) => deployment.status === 'succeeded') ?? deployments[0],
    [],
  );
  const recentDeployments = useMemo(() => deployments.slice(0, 5), []);
  const completedStages = latestRun.stages.filter((stage) => stage.status === 'succeeded').length;

  return (
    <Box>
      <PageHeader
        title="Deployment Dashboard"
        description={`Live CI/CD health for ${applicationInfo.name}, built with Azure Pipelines and shipped to Azure App Service.`}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LaunchRoundedIcon />}
              href={applicationInfo.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open application
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              component={RouterLink}
              to="/pipelines"
            >
              View pipeline runs
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          mb: 2.5,
        }}
      >
        <StatCard
          label="Production status"
          value={dashboardMetrics.productionStatus}
          caption={`${dashboardMetrics.uptimePercent}% uptime over 30 days`}
          icon={<CloudDoneRoundedIcon />}
          color="success"
        />
        <StatCard
          label="Current version"
          value={applicationInfo.version}
          caption={`Image ${applicationInfo.imageTag}`}
          icon={<LayersRoundedIcon />}
          color="info"
        />
        <StatCard
          label="Environment"
          value={applicationInfo.environment}
          caption={`${applicationInfo.region} · ${applicationInfo.instanceCount} instances`}
          icon={<DnsRoundedIcon />}
          color="primary"
        />
        <StatCard
          label="Last deployment"
          value={<Timestamp value={lastSuccessfulDeployment.deployedAt} variant="inherit" />}
          caption={`${lastSuccessfulDeployment.version} by ${lastSuccessfulDeployment.deployedBy}`}
          icon={<RocketLaunchRoundedIcon />}
          color="warning"
        />
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <SectionCard
          title="Overall pipeline status"
          subtitle={`Build ${latestRun.buildNumber} · ${completedStages} of ${latestRun.stages.length} stages complete`}
          action={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <StatusChip status={latestRun.status} size="medium" />
              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                component={RouterLink}
                to={`/pipelines/${latestRun.id}`}
              >
                Run details
              </Button>
            </Stack>
          }
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1, md: 3 }}
            sx={{ flexWrap: 'wrap', mb: 2.5 }}

            useFlexGap
          >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <CallSplitRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                {latestRun.branch}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <CommitRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ fontFamily: monoFontStack }}>
                {shortSha(latestRun.commitSha)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <PersonRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                {latestRun.triggeredBy} · {latestRun.trigger}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Started <Timestamp value={latestRun.startedAt} />
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mb: 2.5, fontWeight: 500 }}>
            {latestRun.commitMessage}
          </Typography>

          <PipelineStageTrack stages={latestRun.stages} />
        </SectionCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.15fr 1fr' },
          mb: 2.5,
        }}
      >
        <SectionCard title="Application information" subtitle={applicationInfo.description}>
          <KeyValueList
            items={[
              { label: 'Application', value: applicationInfo.name },
              { label: 'Version', value: applicationInfo.version },
              { label: 'Environment', value: applicationInfo.environment },
              { label: 'Azure region', value: applicationInfo.region },
              { label: 'Repository', value: applicationInfo.repository },
              { label: 'Branch', value: applicationInfo.branch },
              { label: 'Container registry', value: applicationInfo.containerRegistry },
              { label: 'App Service plan', value: applicationInfo.appServicePlan },
              { label: 'Instances', value: `${applicationInfo.instanceCount} running` },
              { label: 'Health endpoint', value: applicationInfo.healthEndpoint },
            ]}
          />
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Pipeline success rate (last 30 runs)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {dashboardMetrics.successRatePercent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={dashboardMetrics.successRatePercent}
              color="success"
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              Average build time {formatDuration(dashboardMetrics.averageBuildSeconds)} ·{' '}
              {dashboardMetrics.deploymentsThisWeek} deployments this week
            </Typography>
          </Stack>
        </SectionCard>

        <SectionCard
          title="Technology stack"
          subtitle="Runtime, tooling and Azure services backing this release"
        >
          <Stack spacing={2.5}>
            {stackCategories.map((category) => (
              <Box key={category}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1, fontSize: 11 }}
                >
                  {category}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {techStack
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <Chip
                        key={item.name}
                        label={
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {item.name}
                            </Box>
                            <Box
                              component="span"
                              sx={{ fontSize: 11, opacity: 0.72, fontFamily: monoFontStack }}
                            >
                              {item.version}
                            </Box>
                          </Stack>
                        }
                        variant="outlined"
                        sx={{
                          transition: 'transform 140ms ease, border-color 140ms ease',
                          '&:hover': { transform: 'translateY(-1px)', borderColor: 'primary.main' },
                        }}
                      />
                    ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </Box>

      <SectionCard
        title="Recent deployments"
        subtitle="Select a row to inspect the release"
        disableContentPadding
        action={
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/deployments')}
          >
            Full history
          </Button>
        }
      >
        <DeploymentsTable
          deployments={recentDeployments}
          onSelect={setSelectedDeployment}
          showExtraColumns={false}
        />
      </SectionCard>

      <DeploymentDetailsDialog
        deployment={selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
      />
    </Box>
  );
}
