# 18th Digitech Module Registry & AI Module Generator

A sophisticated full-stack platform designed to revolutionize Magento 2 development through AI-driven module generation, discovery, and governance.

## 🚀 Vision
The **18th Registry** serves as the central nervous system for reusable Magento 2 code, enabling developers to search, adapt, and generate validated modules with local architectural context.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14+](https://nextjs.org/), [React 18+](https://react.dev/), [TailwindCSS](https://tailwindcss.com/) |
| **Backend** | [NestJS 10+](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/) |
| **Runtime** | [Node.js 20+](https://nodejs.org/) |
| **Real-time/Tasks** | [Redis](https://redis.io/), [BullMQ](https://docs.bullmq.io/) |
| **Auth** | [JWT (Passport)](https://www.passportjs.org/), [BcryptJS](https://github.com/dcodeIO/bcrypt.js) |
| **Documentation** | [Swagger (OpenAPI 3.0)](https://swagger.io/) |
| **UI Components** | [Lucide React](https://lucide.dev/), [Headless UI v2](https://headlessui.com/) |

---

## 🏗️ Architecture & Modules

The platform follows a **Modular Monorepo** architecture, emphasizing separation of concerns and high-fidelity security.

### 🔐 Security & Identity (RBAC)
- **Role-Based Access Control**: Granular roles including `SUPER_ADMIN`, `ADMIN`, `MAINTAINER`, `REVIEWER`, `DEVELOPER`, and `VIEWER`.
- **Identity Enforcement**: Custom API Decorators (`@RequireRole()`) and Frontend HOCs (`<RequireRole>`) ensure strict adherence to governance policies.
- **JWT Authentication**: Secure stateless sessions with automatic token management.

### 📦 Backend Modules
- **`Auth Module`**: Manages secure logins, registration, and session token generation.
- **`Users Module`**: Full CRUD operations for platform users, including role and status management.
- **`Audit Module`**: A high-fidelity system-wide event tracker documenting every administrative action, resource touched, and actor involved.
- **`Governance Module`**: Central logic for managing complex roles and permissions.
- **`Generation Module`**: The AI core, leveraging BullMQ for asynchronous, non-blocking module generation.
- **`Ingestion Module`**: Handles the processing and indexing of external Magento 2 source code.

### 🎨 Frontend Experience
- **Registry Dashboard**: Modern, responsive UI for module discovery.
- **User Management Hub**: Administrative interface for managing the platform's user base.
- **Security Dashboard**: Integrated Audit log viewer to track system activity in real-time.
- **Profile Center**: Dedicated hub for viewing personal identity, role, and account status.

---

## ⚙️ Development Highlights

### ⚡ Production Readiness
- **Swagger Documentation**: Self-documenting API available at `/api/docs`.
- **Security Hardening**: Built-in `helmet.js` support and global rate limiting.
- **Stabilized Environment**: Fixed `.env` encoding issues (UTF-8) and provided a robust seed strategy for Super Admin identities.
- **Fail-Safe Database**: `synchronize: false` in production mode to protect schema integrity.

---

## 🚦 Getting Started

### 1. Environment Configuration
Ensure your `.env` file in `apps/backend/` is UTF-8 encoded and correctly configured:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/module_registry
JWT_SECRET=your-secure-secret
PORT=3001
NODE_ENV=development
```

### 2. Initialization
```bash
# Install Monorepo dependencies
pnpm install

# Seed the Super Admin account
cd apps/backend
pnpm ts-node scripts/seed.ts

# Start Development Mode
pnpm run dev
```

---

## 📝 Credentials (Default)
**Super Admin Access:**
- **Email**: `admin@18th-digitech.com`
- **Password**: `ChangeMe123!`

---

## 🗺️ Roadmap
- [x] Secure RBAC Core implementation
- [x] Audit Log & Governance Engine
- [x] Production Readiness (Swagger, Security, Env Fixes)
- [ ] Multi-tenant workspace support
- [ ] AI Schema generation refinement

**18th Digitech © 2024** - *Internal Platform Documentation*