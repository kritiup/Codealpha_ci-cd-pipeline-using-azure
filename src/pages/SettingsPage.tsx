import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { applicationInfo, deployments, pipelineRuns } from '../data/mockData';
import type { Density, EnvironmentFilter, ThemeMode } from '../types/settings';
import { formatDateTime } from '../utils/format';
import { monoFontStack } from '../theme/createAppTheme';
import { useSettings } from '../hooks/useSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { KeyValueList } from '../components/ui/KeyValueList';

const refreshIntervals = [10, 15, 30, 60, 120];
const environments: EnvironmentFilter[] = ['All', 'Production', 'Staging', 'Development'];

interface SettingRowProps {
  label: string;
  description: string;
  control: React.ReactNode;
}

function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}

      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ minWidth: 0, maxWidth: 460 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Stack>
  );
}

export function SettingsPage() {
  const { settings, updateSettings, resetSettings, lastRefreshedAt } = useSettings();
  const [toast, setToast] = useState<string | null>(null);

  const latestRun = pipelineRuns[0];
  const latestDeployment = deployments[0];

  return (
    <Box>
      <PageHeader
        title="Settings"
        description="Environment details for this service and the preferences that control how this dashboard behaves."
        action={
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => {
              resetSettings();
              setToast('Dashboard settings restored to defaults');
            }}
          >
            Reset to defaults
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          mb: 2.5,
        }}
      >
        <SectionCard title="Application information" subtitle={applicationInfo.description}>
          <KeyValueList
            items={[
              { label: 'Application name', value: applicationInfo.name },
              { label: 'Current version', value: applicationInfo.version },
              { label: 'Repository', value: applicationInfo.repository },
              { label: 'Default branch', value: applicationInfo.branch },
              {
                label: 'Public URL',
                value: (
                  <Link
                    href={applicationInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    Open
                    <LaunchRoundedIcon sx={{ fontSize: 14 }} />
                  </Link>
                ),
              },
              { label: 'Latest build', value: `${latestRun.buildNumber} · ${latestRun.branch}` },
              {
                label: 'Latest deployment',
                value: `${latestDeployment.version} · ${formatDateTime(latestDeployment.deployedAt)}`,
              },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Environment information"
          subtitle="Azure resources this dashboard will connect to in the next phase"
        >
          <KeyValueList
            items={[
              {
                label: 'Environment',
                value: (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label={applicationInfo.environment}
                  />
                ),
              },
              { label: 'Azure region', value: applicationInfo.region },
              { label: 'App Service plan', value: applicationInfo.appServicePlan },
              { label: 'Instance count', value: `${applicationInfo.instanceCount} instances` },
              { label: 'Container registry', value: applicationInfo.containerRegistry },
              {
                label: 'Image tag',
                value: (
                  <Typography variant="body2" sx={{ fontFamily: monoFontStack, fontWeight: 600 }}>
                    {applicationInfo.imageTag}
                  </Typography>
                ),
              },
              { label: 'Health endpoint', value: applicationInfo.healthEndpoint },
              { label: 'Data source', value: 'Local mock data' },
            ]}
          />
        </SectionCard>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <SectionCard
          title="Appearance"
          subtitle="Applies immediately and is remembered on this device"
        >
          <SettingRow
            label="Colour mode"
            description="Switch between the light dashboard and the dark console theme."
            control={
              <ToggleButtonGroup
                exclusive
                size="small"
                value={settings.themeMode}
                onChange={(_event, value: ThemeMode | null) =>
                  value && updateSettings({ themeMode: value })
                }
              >
                <ToggleButton value="light" sx={{ gap: 0.75, px: 2 }}>
                  <LightModeRoundedIcon sx={{ fontSize: 16 }} />
                  Light
                </ToggleButton>
                <ToggleButton value="dark" sx={{ gap: 0.75, px: 2 }}>
                  <DarkModeRoundedIcon sx={{ fontSize: 16 }} />
                  Dark
                </ToggleButton>
              </ToggleButtonGroup>
            }
          />
          <SettingRow
            label="Row density"
            description="Compact tightens table rows and card padding to fit more on screen."
            control={
              <ToggleButtonGroup
                exclusive
                size="small"
                value={settings.density}
                onChange={(_event, value: Density | null) =>
                  value && updateSettings({ density: value })
                }
              >
                <ToggleButton value="comfortable" sx={{ px: 2 }}>
                  Comfortable
                </ToggleButton>
                <ToggleButton value="compact" sx={{ px: 2 }}>
                  Compact
                </ToggleButton>
              </ToggleButtonGroup>
            }
          />
          <SettingRow
            label="Collapse the sidebar"
            description="Keep the navigation rail narrow so content gets more width."
            control={
              <Switch
                checked={settings.sidebarCollapsed}
                onChange={(event) => updateSettings({ sidebarCollapsed: event.target.checked })}
                slotProps={{ input: { 'aria-label': 'Collapse the sidebar' } }}
              />
            }
          />
        </SectionCard>
      </Box>

      <SectionCard
        title="Dashboard behaviour"
        subtitle={`Data last refreshed at ${lastRefreshedAt.toLocaleTimeString()}`}
      >
        <SettingRow
          label="Auto-refresh"
          description="Periodically re-reads the data source and updates the timestamp in the header."
          control={
            <Switch
              checked={settings.autoRefresh}
              onChange={(event) => updateSettings({ autoRefresh: event.target.checked })}
              slotProps={{ input: { 'aria-label': 'Auto refresh' } }}
            />
          }
        />
        <SettingRow
          label="Refresh interval"
          description="How often the dashboard refreshes while auto-refresh is on."
          control={
            <TextField
              select
              size="small"
              value={settings.refreshIntervalSeconds}
              disabled={!settings.autoRefresh}
              onChange={(event) =>
                updateSettings({ refreshIntervalSeconds: Number(event.target.value) })
              }
              sx={{ minWidth: 150 }}
            >
              {refreshIntervals.map((value) => (
                <MenuItem key={value} value={value}>
                  Every {value} seconds
                </MenuItem>
              ))}
            </TextField>
          }
        />
        <SettingRow
          label="Relative timestamps"
          description='Show "12m ago" instead of a full date. The other form appears on hover.'
          control={
            <Switch
              checked={settings.relativeTimestamps}
              onChange={(event) => updateSettings({ relativeTimestamps: event.target.checked })}
              slotProps={{ input: { 'aria-label': 'Relative timestamps' } }}
            />
          }
        />
        <SettingRow
          label="Rows per page"
          description="Page size for the pipeline runs and deployment history tables."
          control={
            <TextField
              select
              size="small"
              value={settings.rowsPerPage}
              onChange={(event) => updateSettings({ rowsPerPage: Number(event.target.value) })}
              sx={{ minWidth: 120 }}
            >
              {[5, 8, 10, 25].map((value) => (
                <MenuItem key={value} value={value}>
                  {value} rows
                </MenuItem>
              ))}
            </TextField>
          }
        />
        <SettingRow
          label="Default environment filter"
          description="Pre-selects this environment when you open Pipeline Runs or Deployment History."
          control={
            <TextField
              select
              size="small"
              value={settings.defaultEnvironment}
              onChange={(event) =>
                updateSettings({ defaultEnvironment: event.target.value as EnvironmentFilter })
              }
              sx={{ minWidth: 170 }}
            >
              {environments.map((value) => (
                <MenuItem key={value} value={value}>
                  {value === 'All' ? 'All environments' : value}
                </MenuItem>
              ))}
            </TextField>
          }
        />

        <Divider sx={{ mt: 1 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Preferences are stored in this browser only. No backend is connected yet — every page
          reads from local mock data.
        </Typography>
      </SectionCard>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
