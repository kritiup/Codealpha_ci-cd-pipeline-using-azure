import { useState, type MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { applicationInfo } from '../../data/mockData';
import { formatTime } from '../../utils/format';
import { TOPBAR_HEIGHT } from '../../theme/palette';
import { GlobalSearch } from './GlobalSearch';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  const navigate = useNavigate();
  const { settings, updateSettings, lastRefreshedAt, refreshNow } = useSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isDark = settings.themeMode === 'dark';

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const goTo = (path: string) => {
    handleCloseMenu();
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ minHeight: `${TOPBAR_HEIGHT}px !important`, gap: 1.5, px: { xs: 2, md: 3 } }}>
        <IconButton
          onClick={onOpenMobileNav}
          edge="start"
          aria-label="Open navigation"
          sx={{ display: { md: 'none' } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <GlobalSearch />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          size="small"
          icon={<CircleRoundedIcon sx={{ fontSize: '9px !important' }} />}
          label={applicationInfo.environment}
          sx={{
            display: { xs: 'none', lg: 'inline-flex' },
            color: 'success.main',
            backgroundColor: 'color-mix(in srgb, currentColor 12%, transparent)',
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />

        <Stack
          direction="row"
          spacing={0.5}

          sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}
        >
          <Typography variant="caption" color="text.secondary">
            Updated {formatTime(lastRefreshedAt.toISOString())}
          </Typography>
          <Tooltip title="Refresh data now">
            <IconButton onClick={refreshNow} size="small" aria-label="Refresh data">
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            onClick={() => updateSettings({ themeMode: isDark ? 'light' : 'dark' })}
            size="small"
            aria-label="Toggle colour mode"
          >
            {isDark ? (
              <LightModeRoundedIcon fontSize="small" />
            ) : (
              <DarkModeRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={handleOpenMenu} size="small" sx={{ ml: 0.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: 14,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              }}
            >
              KU
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 230, mt: 1 } } }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography variant="subtitle2">Kriti Upadhyay</Typography>
            <Typography variant="caption" color="text.secondary">
              Release Engineer
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => goTo('/logs')}>
            <ListItemIcon>
              <TerminalRoundedIcon fontSize="small" />
            </ListItemIcon>
            Application logs
          </MenuItem>
          <MenuItem onClick={() => goTo('/settings')}>
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              updateSettings({ themeMode: isDark ? 'light' : 'dark' });
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              {isDark ? (
                <LightModeRoundedIcon fontSize="small" />
              ) : (
                <DarkModeRoundedIcon fontSize="small" />
              )}
            </ListItemIcon>
            {isDark ? 'Light mode' : 'Dark mode'}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
