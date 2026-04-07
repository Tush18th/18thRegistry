# 18th Digitech Module Registry & AI Module Generator

A comprehensive platform for managing, discovering, and generating reusable Magento 2 modules with AI assistance.

## Overview

This monorepo contains the full-stack application including:
- **Frontend**: Next.js web application for module browsing and generation
- **Backend**: NestJS API for business logic and data management
- **Worker**: Background job processor for async tasks
- **Shared Packages**: Reusable TypeScript libraries

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Start local services:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   pnpm run migrate
   ```

6. Start development:
   ```bash
   pnpm run dev
   ```

## Project Structure

- `apps/frontend/` - Next.js application
- `apps/backend/` - NestJS API
- `apps/worker/` - Job processor
- `packages/` - Shared libraries
- `tools/` - Configuration and tooling
- `scripts/` - Automation scripts
- `infra/` - Infrastructure as code

## Development

- `pnpm run build` - Build all apps
- `pnpm run test` - Run tests
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Deployment

See `infra/` for Kubernetes and Terraform configurations.

## Contributing

1. Follow the established folder structure
2. Use shared packages for common code
3. Write tests for new features
4. Update documentation

## License

Internal use only.