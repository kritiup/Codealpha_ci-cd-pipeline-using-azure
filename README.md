# DeployHub — CI/CD Pipeline using Azure

A React dashboard for monitoring CI/CD activity — pipeline runs, deployment
history and application logs — together with the Azure pipeline that builds,
containerises and deploys it automatically.

Built for the **CodeAlpha DevOps internship**. The dashboard is the thing being
shipped; the pipeline that ships it is the actual deliverable.

```
  push to main  →  Azure Pipelines  →  Container Registry  →  App Service
                   lint, typecheck,     immutable image        nginx on :8080
                   build, docker build  tagged per build       health-checked
```

Every push to `main` reaches production with no manual step, and a release that
fails to serve traffic fails the pipeline rather than going quietly live.

---

## Layout

| Path | What it is |
|---|---|
| [`azure-pipelines.yml`](azure-pipelines.yml) | The CI/CD definition — build, push, deploy, smoke test. |
| [`Dockerfile`](Dockerfile) | Multi-stage build: Node compiles, nginx serves. |
| [`docker/nginx.conf`](docker/nginx.conf) | SPA routing, caching, gzip, `/healthz`. |
| [`infra/provision-azure.sh`](infra/provision-azure.sh) | Creates the resource group, ACR, plan and web app. |
| [`infra/teardown-azure.sh`](infra/teardown-azure.sh) | Deletes all of it when you are done. |
| [`src/`](src/) | The React + TypeScript + MUI dashboard. |

## Documentation

- **[Azure setup](docs/azure-setup.md)** — provisioning, service connections,
  first run, rollback, troubleshooting.
- **[Monitoring](docs/monitoring.md)** — watching pipeline runs and the running
  app, logs, metrics, alerts, incident checklist.
- **[DevOps concepts](docs/devops-concepts.md)** — the concepts this project
  demonstrates, each tied to the code that implements it.

---

## Run it locally

### The dashboard, with hot reload

```bash
npm install
npm run dev          # http://localhost:5173
```

### The production container

Exactly what gets deployed to Azure:

```bash
docker build -t deployhub:local .
docker run --rm -p 8080:8080 deployhub:local
```

Then <http://localhost:8080>, with the health endpoint at
<http://localhost:8080/healthz>.

### The checks the pipeline runs

```bash
npm run lint
npm run format:check
npm run typecheck
npm run build
```

---

## Deploy it to Azure

Full walkthrough in [docs/azure-setup.md](docs/azure-setup.md). In short:

```bash
az login
./infra/provision-azure.sh      # creates the Azure resources
```

Then create the two service connections (`deployhub-azure` and
`deployhub-acr`) in Azure DevOps, copy the printed resource names into the
variables block of `azure-pipelines.yml`, and point a new pipeline at that
file.

> The App Service plan bills hourly whether or not the site is visited. Run
> `./infra/teardown-azure.sh` when you are finished with it.

---

## How the pipeline works

**Stage 1 — Build.** Installs dependencies with `npm ci` against a cached
store, then runs lint, format check, type check and build. Cheapest gates run
first, so a lint error fails in seconds rather than after a container build.
It then builds the image, stamping it with the build number and commit SHA, and
pushes it to ACR tagged `<buildId>` and `latest`.

Pull requests run everything up to and including `docker build`, but never
push and never deploy.

**Stage 2 — Deploy.** Runs only for `main`. Deploys the immutable
`<buildId>` tag — not `latest` — to App Service as a `deployment` job against
the `deployhub-production` environment, so releases are recorded and a manual
approval can be attached.

It then polls `/healthz` for up to five minutes. Azure accepting the image does
not mean the container started, so the release is only called good once the app
actually answers. If anything fails, a follow-up step pulls the last 100 lines
of container log into the run summary.

**Rolling back** means redeploying an older tag — every past build is still a
complete image. See [rollback](docs/azure-setup.md#rollback).

---

## Tech

**App** — React 19, TypeScript, Vite, Material UI, React Router. The dashboard
runs on local mock data; there is no backend.

**Pipeline** — Azure Pipelines, Azure Container Registry, Azure App Service
(Web App for Containers), Docker, nginx, Azure CLI.
