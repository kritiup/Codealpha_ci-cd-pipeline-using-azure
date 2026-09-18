/** Shared domain types for the DevOps deployment dashboard. */

/** Lifecycle state shared by pipeline runs, stages and deployments. */
export type RunStatus = 'succeeded' | 'failed' | 'running' | 'queued' | 'canceled' | 'skipped';

export type EnvironmentName = 'Production' | 'Staging' | 'Development';

/** What kicked a pipeline run off. */
export type TriggerKind = 'CI' | 'Manual' | 'Pull Request' | 'Scheduled';

/** The four stages of the CI/CD pipeline, in execution order. */
export type StageName = 'Code Build' | 'Docker Build' | 'Push to ACR' | 'Deploy to App Service';

export interface PipelineStage {
  id: string;
  name: StageName;
  status: RunStatus;
  /** Null while the stage is still queued. */
  startedAt: string | null;
  durationSeconds: number;
  /** One-line summary shown in the run detail timeline. */
  summary: string;
}

export interface PipelineRun {
  id: string;
  buildNumber: string;
  status: RunStatus;
  triggeredBy: string;
  trigger: TriggerKind;
  branch: string;
  commitSha: string;
  commitMessage: string;
  startedAt: string;
  durationSeconds: number;
  environment: EnvironmentName;
  stages: PipelineStage[];
}

export interface Deployment {
  id: string;
  version: string;
  status: RunStatus;
  environment: EnvironmentName;
  deployedBy: string;
  deployedAt: string;
  durationSeconds: number;
  buildNumber: string;
  imageTag: string;
  notes: string;
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogSource = 'pipeline' | 'docker' | 'acr' | 'app-service' | 'application';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
}

export interface ApplicationInfo {
  name: string;
  description: string;
  version: string;
  environment: EnvironmentName;
  region: string;
  repository: string;
  branch: string;
  containerRegistry: string;
  imageTag: string;
  appServicePlan: string;
  instanceCount: number;
  healthEndpoint: string;
  url: string;
}

export interface TechStackItem {
  name: string;
  version: string;
  category: 'Frontend' | 'Backend' | 'Infrastructure' | 'CI/CD';
}

/** Headline metrics rendered as stat cards on the dashboard. */
export interface DashboardMetrics {
  productionStatus: 'Healthy' | 'Degraded' | 'Down';
  uptimePercent: number;
  successRatePercent: number;
  averageBuildSeconds: number;
  deploymentsThisWeek: number;
}
