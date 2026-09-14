import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  /** Matches nested routes such as /pipelines/2041. */
  matchPrefix?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: SpaceDashboardRoundedIcon },
  { label: 'Pipeline Runs', path: '/pipelines', icon: AccountTreeRoundedIcon, matchPrefix: true },
  { label: 'Deployment History', path: '/deployments', icon: RocketLaunchRoundedIcon },
  { label: 'Application Logs', path: '/logs', icon: TerminalRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path === '/') return pathname === '/';
  return item.matchPrefix ? pathname.startsWith(item.path) : pathname === item.path;
}
