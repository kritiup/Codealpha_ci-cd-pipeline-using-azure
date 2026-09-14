import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { NavLink, useLocation } from 'react-router-dom';
import { applicationInfo, pipelineRuns } from '../../data/mockData';
import { sidebarColors } from '../../theme/palette';
import { useSettings } from '../../hooks/useSettings';
import { isNavItemActive, navItems } from './navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Closes the temporary drawer after navigating on mobile. */
  onNavigate?: () => void;
  showCollapseButton?: boolean;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapseButton = true,
}: SidebarProps) {
  const location = useLocation();
  const { settings } = useSettings();
  const colors = sidebarColors[settings.themeMode];
  const runningCount = pipelineRuns.filter((run) => run.status === 'running').length;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <Stack
        direction="row"

        spacing={1.5}
        sx={{
          alignItems: 'center',
          px: collapsed ? 1.5 : 2.5,
          height: 68,
          flexShrink: 0,
          borderBottom: `1px solid ${colors.divider}`,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              color: '#fff',
            }}
          >
            <HubRoundedIcon fontSize="small" />
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: colors.activeText, lineHeight: 1.2 }}>
                DeployHub
              </Typography>
              <Typography variant="caption" sx={{ color: colors.muted }}>
                CI/CD Control
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>

      <List sx={{ px: 1.25, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = isNavItemActive(item, location.pathname);
          const Icon = item.icon;
          const showBadge = item.path === '/pipelines' && runningCount > 0;

          const button = (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              sx={{
                mb: 0.5,
                py: 1.15,
                px: collapsed ? 1.25 : 1.75,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: active ? colors.activeText : colors.text,
                backgroundColor: active ? colors.activeBackground : 'transparent',
                position: 'relative',
                transition: 'background-color 160ms ease, color 160ms ease',
                '&:hover': { backgroundColor: active ? colors.activeBackground : colors.hover },
                '&::before': active
                  ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 4,
                      backgroundColor: colors.activeBorder,
                    }
                  : undefined,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.75,
                  color: 'inherit',
                  '& svg': { fontSize: 20 },
                }}
              >
                <Icon />
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { sx: { fontSize: 14, fontWeight: active ? 700 : 500 } },
                    }}
                  />
                  {showBadge && (
                    <Chip
                      size="small"
                      label={runningCount}
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: 11,
                        color: '#fff',
                        backgroundColor: '#2563EB',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  )}
                </>
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              <Box>{button}</Box>
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      <Box sx={{ p: collapsed ? 1.25 : 2, borderTop: `1px solid ${colors.divider}` }}>
        {!collapsed && (
          <Box
            sx={{
              p: 1.75,
              mb: 1.5,
              borderRadius: 2.5,
              backgroundColor: 'rgba(148, 163, 184, 0.10)',
              border: `1px solid ${colors.divider}`,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CircleRoundedIcon sx={{ fontSize: 9, color: '#22C55E' }} />
              <Typography variant="caption" sx={{ color: colors.activeText, fontWeight: 700 }}>
                {applicationInfo.environment}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: colors.muted, display: 'block', mt: 0.5 }}>
              {applicationInfo.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.muted, display: 'block' }}>
              {applicationInfo.version} · {applicationInfo.region}
            </Typography>
          </Box>
        )}

        {showCollapseButton && (
          <Stack direction="row" sx={{ justifyContent: collapsed ? 'center' : 'flex-end' }}>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                sx={{ color: colors.text, '&:hover': { backgroundColor: colors.hover } }}
              >
                {collapsed ? (
                  <ChevronRightRoundedIcon fontSize="small" />
                ) : (
                  <ChevronLeftRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
