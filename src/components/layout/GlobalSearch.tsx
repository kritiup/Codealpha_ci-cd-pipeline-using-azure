import { useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { useNavigate } from 'react-router-dom';
import { deployments, pipelineRuns } from '../../data/mockData';
import { StatusChip } from '../ui/StatusChip';
import type { RunStatus } from '../../types';

interface SearchOption {
  id: string;
  group: 'Pipeline Runs' | 'Deployments';
  primary: string;
  secondary: string;
  status: RunStatus;
  to: string;
}

/** Searches runs and deployments, then routes to the matching detail view. */
export function GlobalSearch() {
  const navigate = useNavigate();

  const options = useMemo<SearchOption[]>(
    () => [
      ...pipelineRuns.map((run) => ({
        id: `run-${run.id}`,
        group: 'Pipeline Runs' as const,
        primary: `${run.buildNumber} · ${run.branch}`,
        secondary: run.commitMessage,
        status: run.status,
        to: `/pipelines/${run.id}`,
      })),
      ...deployments.map((deployment) => ({
        id: `dep-${deployment.id}`,
        group: 'Deployments' as const,
        primary: `${deployment.version} · ${deployment.environment}`,
        secondary: `Deployed by ${deployment.deployedBy} from build ${deployment.buildNumber}`,
        status: deployment.status,
        to: `/deployments?q=${encodeURIComponent(deployment.version)}`,
      })),
    ],
    [],
  );

  return (
    <Autocomplete
      options={options}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => `${option.primary} ${option.secondary}`}
      filterOptions={(items, state) => {
        const query = state.inputValue.trim().toLowerCase();
        if (!query) return [];
        return items
          .filter(
            (item) =>
              item.primary.toLowerCase().includes(query) ||
              item.secondary.toLowerCase().includes(query),
          )
          .slice(0, 8);
      }}
      onChange={(_event, option) => {
        if (option) navigate(option.to);
      }}
      blurOnSelect
      clearOnBlur
      selectOnFocus
      handleHomeEndKeys
      noOptionsText="No builds or deployments match that search"
      sx={{ width: { sm: 240, md: 320, lg: 380 } }}
      slotProps={{ paper: { sx: { mt: 1 } } }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search builds, versions, commits…"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props as typeof props & { key: string };
        return (
          <Box component="li" key={key} {...rest} sx={{ alignItems: 'flex-start !important' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
              {option.group === 'Pipeline Runs' ? (
                <AccountTreeRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              ) : (
                <RocketLaunchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              )}
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {option.primary}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: 'block' }}
                >
                  {option.secondary}
                </Typography>
              </Box>
              <StatusChip status={option.status} />
            </Stack>
          </Box>
        );
      }}
    />
  );
}
