import type {
  ApplicationInfo,
  DashboardMetrics,
  Deployment,
  EnvironmentName,
  LogEntry,
  LogLevel,
  LogSource,
  PipelineRun,
  PipelineStage,
  RunStatus,
  StageName,
  TechStackItem,
  TriggerKind,
} from '../types';

/**
 * Everything below is mock data standing in for Azure DevOps / ACR / App Service.
 * Timestamps are anchored to module load so "12m ago" stays believable in a demo.
 */
const NOW = Date.now();
const MINUTE = 60_000;

function minutesAgo(minutes: number): string {
  return new Date(NOW - minutes * MINUTE).toISOString();
}

export const STAGE_ORDER: StageName[] = [
  'Code Build',
  'Docker Build',
  'Push to ACR',
  'Deploy to App Service',
];

export const applicationInfo: ApplicationInfo = {
  name: 'Contoso Orders API',
  description:
    'Customer-facing order management service backing the Contoso storefront and partner integrations.',
  version: 'v2.8.4',
  environment: 'Production',
  region: 'East US 2',
  repository: 'contoso/orders-api',
  branch: 'main',
  containerRegistry: 'contosoacr.azurecr.io',
  imageTag: 'orders-api:2.8.4',
  appServicePlan: 'asp-contoso-prod (P1v3)',
  instanceCount: 3,
  healthEndpoint: '/api/health',
  url: 'https://contoso-orders-api.azurewebsites.net',
};

export const dashboardMetrics: DashboardMetrics = {
  productionStatus: 'Healthy',
  uptimePercent: 99.98,
  successRatePercent: 94.1,
  averageBuildSeconds: 512,
  deploymentsThisWeek: 9,
};

export const techStack: TechStackItem[] = [
  { name: 'React', version: '19.2', category: 'Frontend' },
  { name: 'TypeScript', version: '6.0', category: 'Frontend' },
  { name: 'Vite', version: '8.3', category: 'Frontend' },
  { name: 'Material UI', version: '9.4', category: 'Frontend' },
  { name: 'Node.js', version: '20.19 LTS', category: 'Backend' },
  { name: 'Express', version: '4.21', category: 'Backend' },
  { name: 'PostgreSQL', version: '16.4', category: 'Backend' },
  { name: 'Redis', version: '7.4', category: 'Backend' },
  { name: 'Docker', version: '27.3', category: 'Infrastructure' },
  { name: 'Azure App Service', version: 'Linux P1v3', category: 'Infrastructure' },
  { name: 'Azure Container Registry', version: 'Premium', category: 'Infrastructure' },
  { name: 'Azure Pipelines', version: 'YAML v2', category: 'CI/CD' },
];

/** One-line stage summaries, keyed by stage and outcome. */
function stageSummary(name: StageName, status: RunStatus): string {
  if (status === 'queued') return 'Waiting for an available build agent';
  if (status === 'skipped') return 'Skipped because an earlier stage did not succeed';
  if (status === 'canceled') return 'Canceled before the stage completed';

  const summaries: Record<StageName, Record<'succeeded' | 'failed' | 'running', string>> = {
    'Code Build': {
      succeeded: 'Restored 412 packages, compiled 1,284 modules, 86 unit tests passed',
      failed: 'TypeScript compilation failed with 3 errors in src/orders/pricing.ts',
      running: 'Compiling modules and running the unit test suite…',
    },
    'Docker Build': {
      succeeded: 'Built a 6-layer image (218 MB) from Dockerfile.prod',
      failed: 'Step 7/12 `npm run build` exited with code 1',
      running: 'Building layer 4 of 6…',
    },
    'Push to ACR': {
      succeeded: 'Pushed image to contosoacr.azurecr.io with tags latest and build SHA',
      failed: 'Registry authentication failed — service principal secret expired',
      running: 'Uploading layers to contosoacr.azurecr.io…',
    },
    'Deploy to App Service': {
      succeeded: 'Staging slot swapped into production, health probe returned 200',
      failed: 'Health probe returned 503 after 5 attempts, deployment rolled back',
      running: 'Warming up the staging slot before swap…',
    },
  };

  return summaries[name][status];
}

interface RunSpec {
  build: number;
  status: RunStatus;
  triggeredBy: string;
  trigger: TriggerKind;
  branch: string;
  sha: string;
  message: string;
  startedMinutesAgo: number;
  environment: EnvironmentName;
  stageStatuses: [RunStatus, RunStatus, RunStatus, RunStatus];
  stageDurations: [number, number, number, number];
}

const runSpecs: RunSpec[] = [
  {
    build: 2041,
    status: 'running',
    triggeredBy: 'Kriti Upadhyay',
    trigger: 'CI',
    branch: 'main',
    sha: '9f2c41ab7de3105c8b6a',
    message: 'feat(orders): add partial refund support to the settlement worker',
    startedMinutesAgo: 4,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'running', 'queued'],
    stageDurations: [148, 96, 41, 0],
  },
  {
    build: 2040,
    status: 'succeeded',
    triggeredBy: 'Kriti Upadhyay',
    trigger: 'CI',
    branch: 'main',
    sha: '4b81de09c7a2f6531e0d',
    message: 'fix(api): return 409 instead of 500 on duplicate order submission',
    startedMinutesAgo: 132,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [162, 104, 58, 176],
  },
  {
    build: 2039,
    status: 'succeeded',
    triggeredBy: 'Arjun Mehta',
    trigger: 'Pull Request',
    branch: 'feature/refund-worker',
    sha: 'c05a7731be94d2681fa4',
    message: 'chore(deps): bump @azure/identity to 4.5.0',
    startedMinutesAgo: 268,
    environment: 'Staging',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [151, 88, 47, 143],
  },
  {
    build: 2038,
    status: 'failed',
    triggeredBy: 'Arjun Mehta',
    trigger: 'CI',
    branch: 'main',
    sha: 'e7d3920164ba58cf0937',
    message: 'refactor(pricing): extract discount rules into a strategy table',
    startedMinutesAgo: 402,
    environment: 'Production',
    stageStatuses: ['succeeded', 'failed', 'skipped', 'skipped'],
    stageDurations: [158, 73, 0, 0],
  },
  {
    build: 2037,
    status: 'succeeded',
    triggeredBy: 'Priya Nair',
    trigger: 'Manual',
    branch: 'main',
    sha: 'a1948bc25f70de3684cc',
    message: 'feat(reporting): nightly settlement export to blob storage',
    startedMinutesAgo: 610,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [171, 112, 51, 168],
  },
  {
    build: 2036,
    status: 'succeeded',
    triggeredBy: 'Azure Pipelines',
    trigger: 'Scheduled',
    branch: 'main',
    sha: '38fe6b0a94c17d25be81',
    message: 'ci: nightly dependency audit and container rebuild',
    startedMinutesAgo: 890,
    environment: 'Staging',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [144, 91, 44, 137],
  },
  {
    build: 2035,
    status: 'canceled',
    triggeredBy: 'Priya Nair',
    trigger: 'Manual',
    branch: 'hotfix/tax-rounding',
    sha: '6cd28e5407fa91b3d20e',
    message: 'hotfix(tax): correct rounding on multi-currency invoices',
    startedMinutesAgo: 1180,
    environment: 'Staging',
    stageStatuses: ['succeeded', 'canceled', 'skipped', 'skipped'],
    stageDurations: [139, 22, 0, 0],
  },
  {
    build: 2034,
    status: 'succeeded',
    triggeredBy: 'Kriti Upadhyay',
    trigger: 'CI',
    branch: 'main',
    sha: 'd4207ea6318cb95f7401',
    message: 'perf(db): add covering index for order lookup by customer',
    startedMinutesAgo: 1495,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [155, 97, 49, 159],
  },
  {
    build: 2033,
    status: 'succeeded',
    triggeredBy: 'Daniel Okafor',
    trigger: 'Pull Request',
    branch: 'feature/webhook-retries',
    sha: '72b6f01dc384ae59103b',
    message: 'feat(webhooks): exponential backoff with dead-letter queue',
    startedMinutesAgo: 1760,
    environment: 'Development',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [149, 86, 43, 128],
  },
  {
    build: 2032,
    status: 'failed',
    triggeredBy: 'Daniel Okafor',
    trigger: 'CI',
    branch: 'main',
    sha: '1e58c739a0b46f2d8c14',
    message: 'test(orders): widen integration coverage for cancellation flow',
    startedMinutesAgo: 2050,
    environment: 'Production',
    stageStatuses: ['failed', 'skipped', 'skipped', 'skipped'],
    stageDurations: [64, 0, 0, 0],
  },
  {
    build: 2031,
    status: 'succeeded',
    triggeredBy: 'Kriti Upadhyay',
    trigger: 'CI',
    branch: 'main',
    sha: 'b93470ae2c18df6501a7',
    message: 'feat(auth): rotate signing keys via managed identity',
    startedMinutesAgo: 2380,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [167, 103, 55, 172],
  },
  {
    build: 2030,
    status: 'succeeded',
    triggeredBy: 'Priya Nair',
    trigger: 'CI',
    branch: 'main',
    sha: '5a0fd8261b47ce930d8f',
    message: 'fix(cache): invalidate catalogue cache on price change events',
    startedMinutesAgo: 2860,
    environment: 'Staging',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [141, 89, 46, 134],
  },
  {
    build: 2029,
    status: 'succeeded',
    triggeredBy: 'Azure Pipelines',
    trigger: 'Scheduled',
    branch: 'main',
    sha: '0d61b4f7ea25839cb016',
    message: 'ci: refresh base image to node:20.19-alpine',
    startedMinutesAgo: 3320,
    environment: 'Staging',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [138, 84, 42, 130],
  },
  {
    build: 2028,
    status: 'failed',
    triggeredBy: 'Arjun Mehta',
    trigger: 'CI',
    branch: 'main',
    sha: 'fc7e13a95d0284bf6712',
    message: 'feat(orders): batch fulfilment endpoint for partner integrations',
    startedMinutesAgo: 3910,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'failed', 'skipped'],
    stageDurations: [153, 95, 38, 0],
  },
  {
    build: 2027,
    status: 'succeeded',
    triggeredBy: 'Daniel Okafor',
    trigger: 'CI',
    branch: 'main',
    sha: '8ba204ce97f13d605e28',
    message: 'docs(api): publish OpenAPI 3.1 schema for partner endpoints',
    startedMinutesAgo: 4400,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [146, 92, 45, 151],
  },
  {
    build: 2026,
    status: 'succeeded',
    triggeredBy: 'Kriti Upadhyay',
    trigger: 'Manual',
    branch: 'main',
    sha: '2f9c6013ad74be82501c',
    message: 'chore(infra): pin App Service runtime and enable health check probe',
    startedMinutesAgo: 5120,
    environment: 'Production',
    stageStatuses: ['succeeded', 'succeeded', 'succeeded', 'succeeded'],
    stageDurations: [159, 99, 52, 164],
  },
];

function buildRun(spec: RunSpec): PipelineRun {
  let elapsed = 0;
  const stages: PipelineStage[] = STAGE_ORDER.map((name, index) => {
    const status = spec.stageStatuses[index];
    const durationSeconds = spec.stageDurations[index];
    const neverStarted = status === 'queued' || status === 'skipped';
    const startedAt = neverStarted
      ? null
      : new Date(NOW - spec.startedMinutesAgo * MINUTE + elapsed * 1000).toISOString();
    elapsed += durationSeconds;

    return {
      id: `${spec.build}-${index + 1}`,
      name,
      status,
      startedAt,
      durationSeconds,
      summary: stageSummary(name, status),
    };
  });

  return {
    id: String(spec.build),
    buildNumber: `#${spec.build}`,
    status: spec.status,
    triggeredBy: spec.triggeredBy,
    trigger: spec.trigger,
    branch: spec.branch,
    commitSha: spec.sha,
    commitMessage: spec.message,
    startedAt: minutesAgo(spec.startedMinutesAgo),
    durationSeconds: spec.stageDurations.reduce((total, value) => total + value, 0),
    environment: spec.environment,
    stages,
  };
}

export const pipelineRuns: PipelineRun[] = runSpecs.map(buildRun);

export const deployments: Deployment[] = [
  {
    id: 'dep-114',
    version: 'v2.8.4',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Kriti Upadhyay',
    deployedAt: minutesAgo(132),
    durationSeconds: 176,
    buildNumber: '#2040',
    imageTag: 'orders-api:2.8.4',
    notes: 'Duplicate order submissions now return 409 instead of failing the request.',
  },
  {
    id: 'dep-113',
    version: 'v2.8.3',
    status: 'succeeded',
    environment: 'Staging',
    deployedBy: 'Arjun Mehta',
    deployedAt: minutesAgo(268),
    durationSeconds: 143,
    buildNumber: '#2039',
    imageTag: 'orders-api:2.8.3',
    notes: 'Dependency bump for @azure/identity ahead of the managed identity rollout.',
  },
  {
    id: 'dep-112',
    version: 'v2.8.2',
    status: 'failed',
    environment: 'Production',
    deployedBy: 'Arjun Mehta',
    deployedAt: minutesAgo(402),
    durationSeconds: 73,
    buildNumber: '#2038',
    imageTag: 'orders-api:2.8.2',
    notes: 'Docker build failed on the pricing refactor; production stayed on v2.8.1.',
  },
  {
    id: 'dep-111',
    version: 'v2.8.1',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Priya Nair',
    deployedAt: minutesAgo(610),
    durationSeconds: 168,
    buildNumber: '#2037',
    imageTag: 'orders-api:2.8.1',
    notes: 'Nightly settlement export enabled for the finance team.',
  },
  {
    id: 'dep-110',
    version: 'v2.8.0',
    status: 'succeeded',
    environment: 'Staging',
    deployedBy: 'Azure Pipelines',
    deployedAt: minutesAgo(890),
    durationSeconds: 137,
    buildNumber: '#2036',
    imageTag: 'orders-api:2.8.0',
    notes: 'Scheduled nightly rebuild against refreshed base image.',
  },
  {
    id: 'dep-109',
    version: 'v2.7.9',
    status: 'canceled',
    environment: 'Staging',
    deployedBy: 'Priya Nair',
    deployedAt: minutesAgo(1180),
    durationSeconds: 22,
    buildNumber: '#2035',
    imageTag: 'orders-api:2.7.9',
    notes: 'Canceled manually after a rounding regression was spotted in review.',
  },
  {
    id: 'dep-108',
    version: 'v2.7.8',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Kriti Upadhyay',
    deployedAt: minutesAgo(1495),
    durationSeconds: 159,
    buildNumber: '#2034',
    imageTag: 'orders-api:2.7.8',
    notes: 'Order lookup p95 latency dropped from 480 ms to 120 ms after the new index.',
  },
  {
    id: 'dep-107',
    version: 'v2.7.7',
    status: 'succeeded',
    environment: 'Development',
    deployedBy: 'Daniel Okafor',
    deployedAt: minutesAgo(1760),
    durationSeconds: 128,
    buildNumber: '#2033',
    imageTag: 'orders-api:2.7.7',
    notes: 'Webhook retry pipeline with dead-letter queue available for integration testing.',
  },
  {
    id: 'dep-106',
    version: 'v2.7.6',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Kriti Upadhyay',
    deployedAt: minutesAgo(2380),
    durationSeconds: 172,
    buildNumber: '#2031',
    imageTag: 'orders-api:2.7.6',
    notes: 'Signing keys now rotate through managed identity; no secrets in the pipeline.',
  },
  {
    id: 'dep-105',
    version: 'v2.7.5',
    status: 'succeeded',
    environment: 'Staging',
    deployedBy: 'Priya Nair',
    deployedAt: minutesAgo(2860),
    durationSeconds: 134,
    buildNumber: '#2030',
    imageTag: 'orders-api:2.7.5',
    notes: 'Catalogue cache invalidation wired to price change events.',
  },
  {
    id: 'dep-104',
    version: 'v2.7.4',
    status: 'succeeded',
    environment: 'Staging',
    deployedBy: 'Azure Pipelines',
    deployedAt: minutesAgo(3320),
    durationSeconds: 130,
    buildNumber: '#2029',
    imageTag: 'orders-api:2.7.4',
    notes: 'Base image refreshed to node:20.19-alpine to pick up security patches.',
  },
  {
    id: 'dep-103',
    version: 'v2.7.3',
    status: 'failed',
    environment: 'Production',
    deployedBy: 'Arjun Mehta',
    deployedAt: minutesAgo(3910),
    durationSeconds: 38,
    buildNumber: '#2028',
    imageTag: 'orders-api:2.7.3',
    notes: 'ACR push rejected: the service principal secret had expired.',
  },
  {
    id: 'dep-102',
    version: 'v2.7.2',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Daniel Okafor',
    deployedAt: minutesAgo(4400),
    durationSeconds: 151,
    buildNumber: '#2027',
    imageTag: 'orders-api:2.7.2',
    notes: 'OpenAPI 3.1 schema published to the partner developer portal.',
  },
  {
    id: 'dep-101',
    version: 'v2.7.1',
    status: 'succeeded',
    environment: 'Production',
    deployedBy: 'Kriti Upadhyay',
    deployedAt: minutesAgo(5120),
    durationSeconds: 164,
    buildNumber: '#2026',
    imageTag: 'orders-api:2.7.1',
    notes: 'App Service runtime pinned and the health check probe enabled.',
  },
];

interface LogTemplate {
  level: LogLevel;
  source: LogSource;
  message: string;
}

const logTemplates: LogTemplate[] = [
  {
    level: 'INFO',
    source: 'pipeline',
    message: 'Pipeline run #2041 queued on agent pool "azure-linux-2204"',
  },
  {
    level: 'INFO',
    source: 'pipeline',
    message: 'Checked out contoso/orders-api at commit 9f2c41a on branch main',
  },
  {
    level: 'DEBUG',
    source: 'pipeline',
    message: 'Restored 412 npm packages from the pipeline cache (cache hit)',
  },
  {
    level: 'INFO',
    source: 'pipeline',
    message: 'Running unit test suite: 86 tests across 24 files',
  },
  { level: 'SUCCESS', source: 'pipeline', message: 'Stage "Code Build" completed in 2m 28s' },
  {
    level: 'INFO',
    source: 'docker',
    message: 'Building image from Dockerfile.prod with build arg NODE_ENV=production',
  },
  {
    level: 'DEBUG',
    source: 'docker',
    message: 'Step 4/12 — COPY package*.json ./ (cached layer reused)',
  },
  { level: 'DEBUG', source: 'docker', message: 'Step 7/12 — RUN npm run build (28.4s)' },
  {
    level: 'WARN',
    source: 'docker',
    message: 'Image size 218 MB exceeds the 200 MB soft budget for this service',
  },
  {
    level: 'SUCCESS',
    source: 'docker',
    message: 'Built image sha256:4f1c9a2e in 1m 36s across 6 layers',
  },
  {
    level: 'INFO',
    source: 'acr',
    message: 'Authenticating to contosoacr.azurecr.io using workload identity',
  },
  { level: 'INFO', source: 'acr', message: 'Pushing orders-api:2.8.4 (6 layers, 218 MB)' },
  {
    level: 'DEBUG',
    source: 'acr',
    message: 'Layer 3/6 already exists in the registry, skipping upload',
  },
  {
    level: 'SUCCESS',
    source: 'acr',
    message: 'Pushed orders-api:2.8.4 and orders-api:latest to contosoacr.azurecr.io',
  },
  {
    level: 'INFO',
    source: 'app-service',
    message: 'Creating deployment slot "staging" on asp-contoso-prod',
  },
  {
    level: 'INFO',
    source: 'app-service',
    message: 'Pulling contosoacr.azurecr.io/orders-api:2.8.4 onto 3 instances',
  },
  {
    level: 'DEBUG',
    source: 'app-service',
    message: 'Container start command: node dist/server.js --port 8080',
  },
  {
    level: 'INFO',
    source: 'app-service',
    message: 'Warming up staging slot, waiting for /api/health to return 200',
  },
  {
    level: 'SUCCESS',
    source: 'app-service',
    message: 'Health probe returned 200 in 4.1s, swapping staging into production',
  },
  {
    level: 'SUCCESS',
    source: 'app-service',
    message: 'Slot swap complete — production now serving v2.8.4',
  },
  {
    level: 'INFO',
    source: 'application',
    message: 'Server listening on port 8080 (pid 1, 3 instances registered)',
  },
  {
    level: 'INFO',
    source: 'application',
    message: 'Connected to PostgreSQL primary at contoso-pg-prod (pool size 20)',
  },
  {
    level: 'INFO',
    source: 'application',
    message: 'Redis cache connected, 12,480 catalogue keys preloaded',
  },
  {
    level: 'DEBUG',
    source: 'application',
    message: 'GET /api/orders?status=pending — 200 in 34ms',
  },
  {
    level: 'DEBUG',
    source: 'application',
    message: 'POST /api/orders — 201 in 118ms (order 8841203 created)',
  },
  {
    level: 'WARN',
    source: 'application',
    message: 'Slow query detected: order_items join exceeded 800ms threshold',
  },
  {
    level: 'WARN',
    source: 'application',
    message: 'Rate limit applied to partner key pk_live_4471 (120 req/min exceeded)',
  },
  {
    level: 'ERROR',
    source: 'application',
    message: 'Payment gateway timeout after 10s for order 8841187, scheduled for retry',
  },
  {
    level: 'ERROR',
    source: 'application',
    message: 'Unhandled rejection in settlement worker: ECONNRESET from clearing-house API',
  },
  {
    level: 'INFO',
    source: 'application',
    message: 'Settlement worker recovered, 42 queued transactions drained',
  },
  { level: 'DEBUG', source: 'application', message: 'GET /api/health — 200 in 3ms' },
  {
    level: 'INFO',
    source: 'pipeline',
    message: 'Build artifacts published to the pipeline drop container',
  },
  {
    level: 'ERROR',
    source: 'pipeline',
    message: 'Run #2038 failed at stage "Docker Build" — step exited with code 1',
  },
  {
    level: 'WARN',
    source: 'acr',
    message: 'Registry quota at 78% of the Premium tier storage allowance',
  },
  {
    level: 'INFO',
    source: 'app-service',
    message: 'Autoscale rule triggered: scaling out to 3 instances (CPU 72%)',
  },
];

/** Deterministic 32-bit LCG so the demo log stream is stable between reloads. */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function generateLogs(count: number): LogEntry[] {
  const random = createSeededRandom(20260912);
  const entries: LogEntry[] = [];
  let offsetMs = 30_000;

  for (let index = 0; index < count; index += 1) {
    const template = logTemplates[Math.floor(random() * logTemplates.length)];
    offsetMs += Math.floor(random() * 210_000) + 15_000;

    entries.push({
      id: `log-${String(count - index).padStart(4, '0')}`,
      timestamp: new Date(NOW - offsetMs).toISOString(),
      level: template.level,
      source: template.source,
      message: template.message,
    });
  }

  return entries;
}

/** Newest first, matching how a log console reads. */
export const applicationLogs: LogEntry[] = generateLogs(140);

/** Used by the live-tail toggle on the Application Logs page. */
export function createLiveLogEntry(sequence: number): LogEntry {
  const random = createSeededRandom((NOW % 100000) + sequence * 7919);
  const template = logTemplates[Math.floor(random() * logTemplates.length)];

  return {
    id: `log-live-${sequence}`,
    timestamp: new Date().toISOString(),
    level: template.level,
    source: template.source,
    message: template.message,
  };
}
