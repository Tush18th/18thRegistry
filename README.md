# 18th Digitech Module Registry & AI Generator

The **18th Digitech Module Registry** is a state-of-the-art, production-grade platform designed for the Magento 2 ecosystem. It acts as the central nervous system for Magento development, integrating AI-driven module generation, a robust codebase registry, and an advanced, highly resilient ephemeral sandbox orchestration engine. 

This document serves as the **Single Source of Truth** for the entire platform, detailing every module, engine, workflow, and architectural decision.

---

## 🌟 1. Platform Identity & Executive Vision

The platform is built to solve core inefficiencies in Magento 2 development: discovery of reusable code, architectural compatibility, and safe validation. It empowers developers and stakeholders to:
- **Generate**: Create complex, context-aware Magento 2 modules using AI (Claude), grounded in existing architectural patterns.
- **Discover & Analyze**: Browse a curated registry of code and perform deep compatibility checks across Magento versions and PHP stacks.
- **Validate Safely**: Deploy modules instantly into fully ephemeral, isolated, containerized Magento environments (Sandboxes) for live, production-like testing.
- **Govern securely**: Maintain strict security and audit standards through granular Role-Based Access Control (RBAC) and enterprise-grade event tracking.

---

## 🧩 2. Product Capabilities & Feature Matrix

### 1. Module Registry & Catalog
- **Centralized storage** for internal and external Magento modules.
- Stores module capabilities, stack requirements, version histories, and AI-generated pattern contexts.
- **Status Workflows**: Modules transition through lifecycle stages (e.g., `DRAFT`, `PENDING`, `APPROVED`, `DEPRECATED`), governed by maintainers.

### 2. AI-Driven Generation Engine
- **Pattern Grounding**: Synthesizes existing module code to teach the AI the company's specific Magento architectural standards.
- **Asynchronous Processing**: Background workers handle LLM generation to prevent HTTP timeouts.
- **Quality Gates**: Automatically runs static analysis on generated code before delivering it as a ZIP stream to the frontend.

### 3. Ephemeral Sandbox Orchestration
- **On-the-fly Infrastructure**: Provisions complete Magento 2 stacks (Nginx, PHP-FPM, MariaDB, Redis) dynamically via `docker-compose`.
- **Automated Lifecycle**: Manages the complete lifecycle from DB instantiation to `setup:upgrade` and final validation.
- **Self-Healing & Troubleshooting**: Features an AI troubleshooter that analyzes runtime logs and suggests remediations if the sandbox fails to boot.
- **Resource Reaping**: Automated TTL enforcements and orphan container cleanup.

### 4. Compatibility Analysis Engine
- Analyzes module components against defined Stack Profiles.
- Generates recommendations for supported Magento requirements (e.g., 2.4.6) and PHP versions (e.g., 8.2).

### 5. Enterprise Governance & Audit
- Fully-featured RBAC.
- High-fidelity audit logging tracking `WHO` did `WHAT` to `WHICH` resource at `WHEN`.

---

## 🏛️ 3. Technical Architecture (The Deep Dive)

The platform employs a **Modular Monorepo** architecture for high cohesion and loose coupling.

### Frontend Stack (`apps/frontend`)
- **Next.js 14+ (App/Pages Router)**: Server-side rendering and static generation.
- **React 18+**: Modular UI components.
- **TailwindCSS & Headless UI v2**: For a scalable, accessible, and responsive design system.
- **React Query**: For scalable data fetching, caching, and state management (e.g., `use-sandbox.ts`, `use-compatibility.ts`).
- **Lucide React**: Clean and consistent iconography.

### Backend Stack (`apps/backend`)
- **NestJS 10+**: Core backend framework emphasizing Modular structure, Dependency Injection, and Decorators for metadata.
- **TypeORM & PostgreSQL 15**: Scalable, relational data modeling and persistence layer.
- **Redis 7 & BullMQ 5**: Distributed task queues for AI generation and heavy sandbox orchestration workflows.
- **Passport (JWT/Bcrypt)**: Secure, stateless authentication system.

### Infrastructure & Orchestration Level (`storage/sandboxes`)
- **Docker Engine API Integration**: The backend interfaces directly with the host machine's docker service via child processes (`execFile`) to rapidly spin up and tear down dynamic `docker-compose.yml` specs partitioned per session.

---

## ⚙️ 4. Internal System Logic (Engine Level Documentation)

### A. The Sandbox Orchestration Pipeline (`OrchestratorEngineService`)
When a user launches a Sandbox, the system pushes a `provision-sandbox` job to the BullMQ orchestration queue. The `SandboxProcessor` consumes it and executes a strict 6-stage lifecycle logic:

1. **INITIALIZING**: Session metadata and `StackProfile` requirements are established.
2. **INFRA_PROVISIONING**: The `DockerComposeProvider` dynamically generates a hardened `docker-compose.yml` (MariaDB, Redis, PHP-FPM, Web) and assigns isolated ports. The containers are brought up in detached state.
3. **BOOTSTRAPPING**: The `ModuleStagerService` prepares the Magento environment. It injects a strict `php-security.ini` (disabling dangerous functions like `exec`, `shell_exec`, etc.) and copies the source module or creates a stub registration. The `bin/magento setup:install` script is executed programmatically against the active DB container.
4. **INSTALLING**: The module is enabled. `bin/magento setup:upgrade` and `cache:flush` are executed to mutate the DB and cache natively.
5. **VALIDATING**: The `RuntimeValidatorService` executes structural checks. It interrogates the PHP container with `module:status`, `setup:di:compile`, and `setup:db:status` to ensure no fatal exceptions exist before exposing the URL to the user.
6. **RUNNING**: The environment is marked live. Valid Storefront and Admin URLs are presented to the UI Dashboard. Absolute TTL bounds are natively scheduled on the BullMQ instance for ultimate teardown.

### B. Sandbox Resilience & Security Engines
- **Log Masking (`LogMaskingService`)**: Uses RegEx heuristics to actively scrub sensitive environment variables (passwords, JWTs, admin keys) out of streaming logs shown to developers.
- **Health Monitor (`HealthMonitorService`)**: Runs every 2 minutes. Probes the storefront HTTP endpoint and evaluates standard Docker container CPU/Memory stats. Terminates sandboxes exhibiting explicit resource abuse (>95% total node usage) to protect the host infrastructure.
- **TTL & Reaper (`ReaperService` & `CleanupSchedulerService`)**:
  - *Soft cleanup:* `CleanupScheduler` checks the DB for naturally expired sessions and issues graceful `terminate-sandbox` jobs.
  - *Hard cleanup (The Reaper):* Runs every 6h. It queries the actual Docker instance directly for containers bearing the `18th-sandbox.session-id` labels. Any running containers missing from the authorized active DB are aggressively killed using `docker rm -f`. This is a fail-safe mechanism against code-level orchestration failures.
- **AI Troubleshooter (`TroubleshooterService`)**: If a pipeline stage fails (e.g., Magento throws a DI compilation exception), the context, event history, and stack traces are bundled into a prompt for Claude AI. The AI provides a root-cause explanation and actionable remediation strategy inside the UI Sandbox Dashboard, drastically shortening debugging timelines.
- **Termination Policy (`TerminationPolicyService`)**: Evaluates role-based limits (e.g., Admin vs Developer) to dictate maximum TTL, max lifetime (e.g., max 4 hours for Devs, up to 24 hours for Admins), and max permitted extensions.

### C. AI Generation Engine (`AiGenerationService`)
1. Translates frontend intent strings into precise, Magento-aware architectural prompts (`PromptService`).
2. Leverages recursive fetching via `referenceModuleIds` to extract target codebase architecture patterns (`PatternService`).
3. Connects to the Claude AI API for robust, multi-file code synthesis (`ClaudeService`).
4. Outputs the synthetically generated code to a localized temporary filesystem workspace.
5. Employs `archiver` to silently compress the working directory into a ZIP and stream it natively into the HTTP response.
6. Introduces a delayed, asynchronous file removal event to clear the temporary workspace 15 minutes post-download execution.

### D. Compatibility Engine (`CompatibilityService`)
A separate analytical engine designed to parse and infer if a module can operate robustly on varying Magento infrastructure boundaries (e.g., 2.4.4 vs 2.4.6). Currently evaluating mock static data payloads mapped to the `AnalysisStatus` DB models for initial UI/API scaffolding, laying the technical foundation for AST token analysis via custom PHPStan processors in upcoming roadmaps.

---

## 🔐 5. Role-Based Governance (RBAC) & Audit

### Roles Hierarchy
- **SUPER_ADMIN**: God-mode. Overrides sandbox tear-downs, grants roles, sees the raw audit pipeline.
- **ADMIN**: High-level managers governing the overarching sandbox policies and user configurations.
- **MAINTAINER**: Functional code validators managing module catalog transitions (Draft -> Review -> Approved).
- **DEVELOPER**: The standard creator. Granted access to generate modules, push drafts, and spin personal isolated test Sandboxes.
- **VIEWER**: Basic read-only capability for discovery of the Registry codebase.

### Audit Trail (`AuditService` & `GovernanceService`)
A high-fidelity global logging solution that wraps all administrative controllers. Every executed modification logs the sequence:
`Action Name` (E.g., `SANDBOX_LAUNCH_REQUESTED`) -> `Target Resource Type` -> `Target ID` -> `Invoking Actor ID` -> `Payload Details` -> `Resolved IP Address`.

---

## 🛣️ 6. End-to-End Workflows (User Journeys)

### Workflow 1: AI Generation to Custom Deployment
1. **Developer Motivation**: Wants a new checkout tax integration.
2. In the AI Generator UI, the user types the `Intent`, names the module, and flags existing checkout modules as architectural references.
3. Backend fetches referenced module trees, infers pattern standards, queries Claude, and returns a ZIP file. Concurrently, a module is marked `DRAFT` in the Postgres Registry.
4. The Developer investigates the ZIP, makes arbitrary adjustments, and navigates to the Sandbox Dashboard.
5. They invoke a `Launch Sandbox` request and bind it to a `StackProfile`.
6. The Orchestrator cycles through the 6-stage lifecycle, resulting in a live Storefront URL.
7. Post-validation, the Developer submits the `DRAFT` to `PENDING` for a `MAINTAINER` review.

### Workflow 2: Sandbox Lifecycle & Extension Escalation
1. Sandbox goes live with a predefined TTL (e.g., defaulted to 4 hours in Dev policy).
2. The UI polls `useSandboxSession` and displays the countdown ticker.
3. **T-15m Boundary**: A generic warning event is emitted to the timeline view.
4. **T-2m Boundary**: The session aggressively transitions to `AWAITING_APPROVAL`. The Developer is prompted required approval to "Extend Session".
5. If the user invokes the Extension endpoint, the TTL is recalculated adding 30m intervals (maxed by `maxExtensions` rule).
6. If the user abandons the portal, the delayed scheduled worker wakes up, recognizes the timeout, changes to `TERMINATING`, invokes the destruction routines, and drops the containers. 

---

## 📂 7. Complete Folder Structure

```text
.
├── apps/
│   ├── backend/             # NestJS Application (The Core Control Plane)
│   │   ├── src/
│   │   │   ├── modules/     # Self-Contained Domain Features
│   │   │   │   ├── audit/         # System-level event tracking models
│   │   │   │   ├── auth/          # Authentication & user provisioning
│   │   │   │   ├── compatibility/ # Magento infrastructure compatibility checks
│   │   │   │   ├── export/        # File egress controllers
│   │   │   │   ├── generation/    # Claude LLM orchestration pipeline
│   │   │   │   ├── governance/    # Status approvals and audit aggregators
│   │   │   │   ├── ingestion/     # Future source code parsers
│   │   │   │   ├── modules/       # The Registry Catalog entities
│   │   │   │   ├── sandbox/       # The massive ephemeral orchestration engine
│   │   │   │   └── sandbox-admin/ # Admin-level override controllers
│   │   │   ├── scripts/     # Utility files (CLI seeding, migrations execution)
│   │   │   ├── migrations/  # TypeORM DB Schema transitions
│   │   │   └── main.ts      # Application bootstrap and middleware configs
│   │   └── storage/         # Temporary physical layer for Workspaces/Zips/Sandboxes
│   └── frontend/            # Next.js 14 Application (The Interface)
│       ├── src/
│       │   ├── components/  # Core shared React UI Elements
│       │   │   ├── library/ # Registry grid blocks
│       │   │   └── sandbox/ # Live view blocks (LogViewer, StageStepper)
│       │   ├── hooks/       # The React Query Data Access mapping layer
│       │   ├── pages/       # App routing endpoints (Next.js Pages methodology)
│       │   │   ├── admin/   # Governance panel views
│       │   │   ├── library/ # Catalogue views
│       │   │   └── sandboxes/ # Sandbox administration
│       │   └── types/       # Strictly typed UI payload boundaries
├── packages/
│   └── shared-types/        # Monorepo semantic types bridging front to back
├── .env.example             # Documented secret map defaults
├── docker-compose.yml       # Foundational DB/Redis backing services
└── turbo.json               # Pipeline commands for the Turborepo execution engine
```

---

## 🚀 8. Environment Setup & Installation

### Core Prerequisites
- **Node.js**: `v20+` (LTS)
- **pnpm**: `v9+`
- **Docker engine**: Critical for sandbox environments. (If executing locally on Windows, ensure your `WSL 2` backend is functioning appropriately for file mapping).

### Step-by-Step Installation

1. **Repository Instantiation**
   ```bash
   git clone <repo-url>
   cd 18th-registry
   pnpm install
   ```

2. **Environment Parameterization**
   Ensure valid `.env` maps are populated in `./apps/backend/.env` and `./apps/frontend/.env`. Base file encoding must be UTF-8.
   ```env
   # Format Configuration Example (Backend)
   DATABASE_URL=postgresql://user:password@localhost:5432/module_registry
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=super_secret_key_123
   CLAUDE_API_KEY=your_anthropic_api_key
   PORT=3001
   ```

3. **Core Dependencies Boot**
   Bring the local instances of Postgres and Redis into active state.
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Database Scaffolding**
   Push the active schemas and seed the initial Super Admin profile using the core scripts.
   ```bash
   cd apps/backend
   pnpm run migrate
   pnpm run seed:demo
   ```

5. **Start Application Cluster**
   Run the full turbo pipeline (starts frontend, backend, and background workers concurrently).
   ```bash
   pnpm run dev
   ```

### Default Credentials
- **Email**: `admin@18th-digitech.com`
- **Password**: `ChangeMe123!`

---

## ⚠️ 9. Assumptions, Limitations & Constraints

- **Host Hardware Limits**: Booting a complete functional Magento 2 sandbox is an extraordinarily dense hardware operation. Each sandbox container stack requests roughly ~4GB RAM and ~2 CPUs to function effectively. Attempting to spool more than 2-3 overlapping instances concurrently on standard developer machines typically induces violent OOM kills or extreme CPU lag.
- **Port Management Approach**: The `DockerComposeProvider` functionally allocates open random high-ports for parallel sandbox proxying. While the statistical probability for immediate collisions is low, explicit port reservations aren't technically constrained natively at this layer.
- **Docker API Operating Boundary**: The backend requires raw `docker-compose` logic layer execution. If pushed to a traditional production host, the NestJS container must leverage Docker Socket mounting or alternatively be refactored specifically to target managed Kubernetes context execution (e.g. provisioning Pod topologies).
- **Synchronicity Requirement**: Under no circumstances should `synchronize: true` exist inside the overarching `TypeORMModule` in a deployed or integrated environment to prevent silent schema wipe-outs.

---

## 🔮 10. Best Practices & Future Horizons

### Best Practices Enforced
- **Strict Separation of Concerns**: Controller endpoints strictly process HTTP edge mapping semantics. Heavy lifting lives exclusively inside designated Injectable Services. External integration implementations (e.g., Docker commands) are fundamentally abstracted behind strict Interfaces (`InfraProvider`).
- **Resilient Background Processing**: Absolutely zero backend requests hang idle waiting for a 5-minute sandbox deployment process to fulfill. Everything massive is dynamically mapped into BullMQ queues and tracked by non-blocking polling mechanics via decoupled processors.
- **Secure by Default Principles**: By design, Sandbox payloads implicitly strip all inherited Linux kernel capabilities (`cap_drop: ALL`) and force explicit `no-new-privileges` to brutally minimize the potential damage area of malicious code breaking sandbox execution.

### Identified Improvement Tracks (Future Roadmap)
- **Kubernetes Architecture Shift**: Swap the local `DockerComposeProvider` implementation with a formalized `KubernetesProvider` mapping to natively scale Magento cluster sizes securely via horizontal node balancing strategies in the cloud.
- **Websockets Expansion Protocol**: Currently the frontend events and terminal log viewers depend on highly aggressive HTTP ping polling logic within `useSandboxSession`. Formally rewriting this stream to operate strictly on a pure WebSockets event pipe would heavily optimize network transit performance.
- **PHPStan Static AST Integration**: Extrapolating the current Mock heuristics logic mapped into the Compatibility Service to natively operate active PHPStan binaries parsing source module ASTs against custom constraint sets.

---
*Built & Documented by the 18th Digitech Engineering Team | Architecture & Implementation Mastery*