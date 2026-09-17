import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { useSearchParams } from 'react-router-dom';
import { deployments } from '../data/mockData';
import type { Deployment, EnvironmentName, RunStatus } from '../types';
import type { EnvironmentFilter } from '../types/settings';
import { formatDuration } from '../utils/format';
import { ALL_RUN_STATUSES, getStatusVisual } from '../utils/status';
import { useSettings } from '../hooks/useSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { DeploymentsTable } from '../components/ui/DeploymentsTable';
import { DeploymentDetailsDialog } from '../components/ui/DeploymentDetailsDialog';
import { EmptyState } from '../components/ui/EmptyState';

type StatusFilter = RunStatus | 'All';

const environments: EnvironmentFilter[] = ['All', 'Production', 'Staging', 'Development'];

export function DeploymentHistoryPage() {
  const { settings, updateSettings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') ?? '',
    status: 'All' as StatusFilter,
    environment: settings.defaultEnvironment,
    deployedBy: 'All',
  });
  const { search, status, environment, deployedBy } = filters;

  /** Any filter change returns to the first page of results. */
  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };
  const [selected, setSelected] = useState<Deployment | null>(null);

  // Keep the URL in step with the search box so links stay shareable.
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (current === search) return;
    const next = new URLSearchParams(searchParams);
    if (search) next.set('q', search);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [search, searchParams, setSearchParams]);

  const people = useMemo(
    () => ['All', ...Array.from(new Set(deployments.map((item) => item.deployedBy)))],
    [],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deployments.filter((deployment) => {
      const matchesQuery =
        !query ||
        deployment.version.toLowerCase().includes(query) ||
        deployment.buildNumber.toLowerCase().includes(query) ||
        deployment.imageTag.toLowerCase().includes(query) ||
        deployment.deployedBy.toLowerCase().includes(query) ||
        deployment.notes.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || deployment.status === status;
      const matchesEnvironment =
        environment === 'All' || deployment.environment === (environment as EnvironmentName);
      const matchesPerson = deployedBy === 'All' || deployment.deployedBy === deployedBy;

      return matchesQuery && matchesStatus && matchesEnvironment && matchesPerson;
    });
  }, [search, status, environment, deployedBy]);

  const rowsPerPage = settings.rowsPerPage;
  const visible = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const hasActiveFilters =
    search !== '' || status !== 'All' || environment !== 'All' || deployedBy !== 'All';

  const clearFilters = () =>
    updateFilters({ search: '', status: 'All', environment: 'All', deployedBy: 'All' });

  const succeeded = deployments.filter((item) => item.status === 'succeeded').length;
  const failed = deployments.filter((item) => item.status === 'failed').length;
  const averageDuration = Math.round(
    deployments.reduce((total, item) => total + item.durationSeconds, 0) / deployments.length,
  );

  return (
    <Box>
      <PageHeader
        title="Deployment History"
        description="Every release pushed to Azure App Service, newest first. Select a row for the full release record."
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
          label="Total deployments"
          value={deployments.length}
          caption="Across all environments"
          icon={<RocketLaunchRoundedIcon />}
        />
        <StatCard
          label="Successful"
          value={succeeded}
          caption={`${Math.round((succeeded / deployments.length) * 100)}% success rate`}
          icon={<CheckCircleRoundedIcon />}
          color="success"
        />
        <StatCard
          label="Failed"
          value={failed}
          caption="Rolled back automatically"
          icon={<ErrorRoundedIcon />}
          color="error"
        />
        <StatCard
          label="Average duration"
          value={formatDuration(averageDuration)}
          caption="Image pull through slot swap"
          icon={<TimerRoundedIcon />}
          color="info"
        />
      </Box>

      <Card>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              value={search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              size="small"
              placeholder="Search version, build, image tag or notes…"
              sx={{ flexGrow: 1, minWidth: { md: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(event) => updateFilters({ status: event.target.value as StatusFilter })}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All">All statuses</MenuItem>
              {ALL_RUN_STATUSES.map((value) => (
                <MenuItem key={value} value={value}>
                  {getStatusVisual(value).label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Environment"
              value={environment}
              onChange={(event) =>
                updateFilters({ environment: event.target.value as EnvironmentFilter })
              }
              sx={{ minWidth: 160 }}
            >
              {environments.map((value) => (
                <MenuItem key={value} value={value}>
                  {value === 'All' ? 'All environments' : value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Deployed by"
              value={deployedBy}
              onChange={(event) => updateFilters({ deployedBy: event.target.value })}
              sx={{ minWidth: 170 }}
            >
              {people.map((value) => (
                <MenuItem key={value} value={value}>
                  {value === 'All' ? 'Anyone' : value}
                </MenuItem>
              ))}
            </TextField>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                color="inherit"
                startIcon={<FilterAltOffRoundedIcon />}
                sx={{ flexShrink: 0 }}
              >
                Clear
              </Button>
            )}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Showing {filtered.length} of {deployments.length} deployments
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <EmptyState
            title="No deployments match these filters"
            description="Try another version number, environment or engineer."
            action={
              <Button variant="outlined" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <DeploymentsTable deployments={visible} onSelect={setSelected} />
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 8, 10, 25]}
              onRowsPerPageChange={(event) => {
                updateSettings({ rowsPerPage: Number(event.target.value) });
                setPage(0);
              }}
            />
          </>
        )}
      </Card>

      <DeploymentDetailsDialog deployment={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
