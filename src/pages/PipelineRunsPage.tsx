import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import { useNavigate } from 'react-router-dom';
import { pipelineRuns } from '../data/mockData';
import type { EnvironmentName, RunStatus } from '../types';
import type { EnvironmentFilter } from '../types/settings';
import { formatDuration, shortSha } from '../utils/format';
import { ALL_RUN_STATUSES, getStatusVisual } from '../utils/status';
import { monoFontStack } from '../theme/createAppTheme';
import { useSettings } from '../hooks/useSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { StatusChip } from '../components/ui/StatusChip';
import { StageDots } from '../components/ui/StageDots';
import { Timestamp } from '../components/ui/Timestamp';
import { EmptyState } from '../components/ui/EmptyState';

type StatusFilter = RunStatus | 'All';

const environments: EnvironmentFilter[] = ['All', 'Production', 'Staging', 'Development'];

export function PipelineRunsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: 'All' as StatusFilter,
    environment: settings.defaultEnvironment,
    branch: 'All',
  });
  const { search, status, environment, branch } = filters;

  /** Any filter change returns to the first page of results. */
  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };

  const branches = useMemo(
    () => ['All', ...Array.from(new Set(pipelineRuns.map((run) => run.branch)))],
    [],
  );

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pipelineRuns.filter((run) => {
      const matchesQuery =
        !query ||
        run.buildNumber.toLowerCase().includes(query) ||
        run.commitMessage.toLowerCase().includes(query) ||
        run.commitSha.toLowerCase().includes(query) ||
        run.triggeredBy.toLowerCase().includes(query) ||
        run.branch.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || run.status === status;
      const matchesEnvironment =
        environment === 'All' || run.environment === (environment as EnvironmentName);
      const matchesBranch = branch === 'All' || run.branch === branch;

      return matchesQuery && matchesStatus && matchesEnvironment && matchesBranch;
    });
  }, [search, status, environment, branch]);

  const rowsPerPage = settings.rowsPerPage;
  const visibleRuns = filteredRuns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const hasActiveFilters =
    search !== '' || status !== 'All' || environment !== 'All' || branch !== 'All';

  const clearFilters = () =>
    updateFilters({ search: '', status: 'All', environment: 'All', branch: 'All' });

  const succeeded = pipelineRuns.filter((run) => run.status === 'succeeded').length;
  const failed = pipelineRuns.filter((run) => run.status === 'failed').length;
  const averageDuration = Math.round(
    pipelineRuns.reduce((total, run) => total + run.durationSeconds, 0) / pipelineRuns.length,
  );

  return (
    <Box>
      <PageHeader
        title="Pipeline Runs"
        description="Every Azure Pipelines execution for this service. Select a run to inspect its individual stages."
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
          label="Total runs"
          value={pipelineRuns.length}
          caption="Retained for the last 30 days"
          icon={<AccountTreeRoundedIcon />}
        />
        <StatCard
          label="Succeeded"
          value={succeeded}
          caption={`${Math.round((succeeded / pipelineRuns.length) * 100)}% of all runs`}
          icon={<CheckCircleRoundedIcon />}
          color="success"
        />
        <StatCard
          label="Failed"
          value={failed}
          caption="Investigate before the next release"
          icon={<ErrorRoundedIcon />}
          color="error"
        />
        <StatCard
          label="Average duration"
          value={formatDuration(averageDuration)}
          caption="Across all four stages"
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
              placeholder="Search build, commit, branch or author…"
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
              label="Branch"
              value={branch}
              onChange={(event) => updateFilters({ branch: event.target.value })}
              sx={{ minWidth: 180 }}
            >
              {branches.map((value) => (
                <MenuItem key={value} value={value}>
                  {value === 'All' ? 'All branches' : value}
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
            Showing {filteredRuns.length} of {pipelineRuns.length} runs
          </Typography>
        </Box>

        {filteredRuns.length === 0 ? (
          <EmptyState
            title="No pipeline runs match these filters"
            description="Try a different build number, branch or status."
            action={
              <Button variant="outlined" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Build</TableCell>
                    <TableCell>Commit</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Stages</TableCell>
                    <TableCell>Date / time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Triggered by</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRuns.map((run) => (
                    <TableRow
                      key={run.id}
                      hover
                      onClick={() => navigate(`/pipelines/${run.id}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open build ${run.buildNumber}`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/pipelines/${run.id}`);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, fontFamily: monoFontStack }}
                        >
                          {run.buildNumber}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ alignItems: 'center', mt: 0.25 }}
                        >
                          <CallSplitRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            title={run.branch}
                            sx={{ maxWidth: 150 }}
                          >
                            {run.branch}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="body2" noWrap title={run.commitMessage}>
                          {run.commitMessage}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: monoFontStack }}
                        >
                          {shortSha(run.commitSha)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={run.status} />
                      </TableCell>
                      <TableCell>
                        <StageDots stages={run.stages} />
                      </TableCell>
                      <TableCell>
                        <Timestamp value={run.startedAt} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(run.durationSeconds)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {run.triggeredBy}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={run.trigger}
                          sx={{ mt: 0.4, height: 20, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRuns.length}
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
    </Box>
  );
}
