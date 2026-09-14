import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '../../theme/palette';
import { useSettings } from '../../hooks/useSettings';

/** Permanent dark sidebar on desktop, temporary drawer on mobile. */
export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { settings, updateSettings } = useSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const collapsed = settings.sidebarCollapsed;
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const toggleCollapse = () => updateSettings({ sidebarCollapsed: !collapsed });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {isDesktop ? (
        <Box
          component="nav"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', { duration: 220 }),
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              width: sidebarWidth,
              transition: theme.transitions.create('width', { duration: 220 }),
              zIndex: theme.zIndex.drawer,
            }}
          >
            <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
          </Box>
        </Box>
      ) : (
        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, border: 'none' } } }}
        >
          <Sidebar
            collapsed={false}
            onToggleCollapse={toggleCollapse}
            onNavigate={() => setMobileNavOpen(false)}
            showCollapseButton={false}
          />
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <Box
          component="main"
          sx={{ flexGrow: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 3.5 } }}
        >
          <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
