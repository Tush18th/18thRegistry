# 18th Digitech Backend Engine (NestJS)

The core security, generation, and orchestration engine of the 18th Registry platform.

## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT-based Security**: Secure token issuance and validation.
- **RBAC Enforcement**: Custom `RolesGuard` and permissions management.
- **Security Headers**: Integrated `helmet` support.
- **Rate Limiting**: Throttling for sensitive endpoints.

### 📚 Interactive API Documentation
- **Swagger Powered**: Full OpenAPI 3.0 specification.
- **URL**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Interactive Console**: Test all endpoints directly with Bearer authentication.

## 🏗️ Module Architecture

- **`Auth`**: Session management and register/login.
- **`Users`**: CRUD for user profiles and identity management.
- **`Audit`**: Comprehensive activity timeline and governance logs.
- **`Generation`**: BullMQ-based async module generation engine.
- **`Modules`**: Registry management for Magento 2 modules.
- **`Ingestion`**: High-performance module source processing.

---

## 🛠️ Infrastructure Requirements

- **PostgreSQL 14+**: Core persistent storage.
- **Redis 7+**: BullMQ task processing broker.

---

## 🚦 Local Startup

1. **Environment Setup**: 
   Ensure `apps/backend/.env` exists with **UTF-8** encoding.
2. **Seed Data**:
   ```bash
   pnpm ts-node scripts/seed.ts
   ```
3. **Execution**:
   ```bash
   pnpm run start:dev
   ```

---

## ⚙️ CI/CD & Production
- **Build**: `pnpm run build`
- **Production Server**: `node dist/main.js`
- **Migrations**: `pnpm run migrate` (Required if `synchronize` is disabled).
