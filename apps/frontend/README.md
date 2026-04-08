# 18th Digitech Next.js Frontend Framework

The user-facing platform for the **18th Module Registry & AI Generator**.

## 🎨 Professional UI & Aesthectics

- **Modern Stack**: Next.js 14 (App/Pages), TailwindCSS, Lucide Icons, Headless UI v2.
- **Rich Interaction**: Glassmorphism, premium gradients, and smooth state transitions.
- **Context-Aware Sidebar**: Dynamic role-based navigation and authentication tracking.

## 🚀 Pages & Functional Areas

### 🖥️ Dashboard (/dashboard)
- **Central Hub**: Unified interface for AI Generation and Module Discovery.
- **Search Engine**: High-performance module library search.

### 🔐 Auth & Identity
- **Login (/login)**: Secure authentication with automatic session persistence.
- **Profile (/profile)**: Comprehensive user profile dashboard.

### 🛠️ Administration
- **User Management (/admin/users)**: Full administrative CRUD (Super Admin/Admin only).
- **Audit Logs (/admin/audit)**: High-resolution system activity timeline.

## 🔄 Technical Integration

- **AuthContext**: React Context for global user identity and RBAC enforcement.
- **API Interceptors**: Axios-based request/response handling with automatic token injection.
- **RequireRole HOC**: Higher-Order Component for granular UI component protection.

---

## 🚦 Local Startup

1. **Install Node Dependencies**:
   ```bash
   pnpm install
   ```
2. **Environment Configuration**:
   ```bash
   NEXT_PUBLIC_BASE_API_URL=http://localhost:3001/api/v1
   ```
3. **Execution**:
   ```bash
   pnpm run dev
   ```

---

## ⚙️ CI/CD & Production
- **Build**: `pnpm run build`
- **Frontend Server**: `pnpm run dev`
- **Linting**: `pnpm run lint`
- **Port**: Default `3000`
