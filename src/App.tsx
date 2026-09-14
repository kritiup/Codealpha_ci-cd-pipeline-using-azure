import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useSettings } from './hooks/useSettings';
import { createAppTheme } from './theme/createAppTheme';
import { DashboardPage } from './pages/DashboardPage';
import { PipelineRunsPage } from './pages/PipelineRunsPage';
import { PipelineRunDetailPage } from './pages/PipelineRunDetailPage';
import { DeploymentHistoryPage } from './pages/DeploymentHistoryPage';
import { ApplicationLogsPage } from './pages/ApplicationLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const { settings } = useSettings();
  const theme = useMemo(
    () => createAppTheme(settings.themeMode, settings.density),
    [settings.themeMode, settings.density],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pipelines" element={<PipelineRunsPage />} />
          <Route path="/pipelines/:runId" element={<PipelineRunDetailPage />} />
          <Route path="/deployments" element={<DeploymentHistoryPage />} />
          <Route path="/logs" element={<ApplicationLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Legacy path kept working so bookmarks do not break. */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
