# Copilot Instructions for Nimbus ERP

## Project Overview
PERN stack ERP application with JWT authentication and RBAC authorization. Backend (Express + Prisma) on port 3001, frontend (React + Vite) on port 5173. Originally generated from PRD-to-Tasks - see `docs/tasks-export-nimbus-6.1.md` for detailed task structure.

## Architecture & Data Flow

### Monorepo Structure
- **Root**: Workspace commands (`npm run dev`, `npm run install:all`)
- **backend/**: Express API with Prisma ORM (ESM modules, `.js` extensions in imports)
- **frontend/**: React SPA with Vite, React Router 7, Tailwind CSS

### Authentication Flow
1. Login/Register → JWT tokens stored in localStorage (`accessToken`, `refreshToken`)
2. `apiService` auto-attaches Bearer token from localStorage to all requests
3. Backend `authenticate` middleware verifies JWT, attaches `req.user` payload
4. Frontend `AuthContext` provides `hasPermission(resource, action)` and `hasRole(name)`

### Authorization Pattern
Backend uses **resource-action RBAC**: `authorize('warehouse', 'create')` middleware checks if user's role has permission for that resource+action. Frontend mirrors this with `<ProtectedRoute requiredPermission={{ resource: 'warehouse', action: 'read' }}>`.

Permissions are named as `resource.action` (e.g., `warehouse.create`, `users.delete`) in database. See `backend/prisma/seed.ts` for full permission matrix.

## Critical Developer Workflows

### Database Changes
```bash
cd backend
npx prisma db push        # Push schema without migration (dev)
npx prisma migrate dev    # Create migration (production-ready)
npx prisma db seed        # Seed default roles/permissions/admin user
npx prisma studio         # Browse data (port 5555)
```

### Development
```bash
# From root:
npm run dev                    # Starts both backend and frontend
npm run install:all            # Install all dependencies

# Backend only (port 3001):
cd backend && npm run dev      # tsx watch mode

# Frontend only (port 5173):
cd frontend && npm run dev     # Vite dev server
```

**Default credentials** (after seeding): `admin@example.com` / `Admin@123`

### ESM Import Rules (Backend)
All backend imports MUST include `.js` extension:
```typescript
import { authenticate } from '../middleware/auth.js';  // ✅ Correct
import { authenticate } from '../middleware/auth';     // ❌ Breaks
```
This is because `"type": "module"` in backend/package.json.

## Project-Specific Conventions

### API Service Pattern (Frontend)
Centralized in `frontend/src/services/api.ts`:
```typescript
// Generic CRUD
await apiService.get<T>('/endpoint');
await apiService.post<T>('/endpoint', data);

// Auth-specific
await apiService.login(credentials);
await apiService.getCurrentUser();
```
**Never** manually construct API URLs or manage tokens outside `apiService` class.

### Protected Routes
All routes except `/login` and `/register` must be wrapped:
```tsx
<Route path="/warehouse" element={
  <ProtectedRoute requiredPermission={{ resource: 'warehouse', action: 'read' }}>
    <Layout><Warehouse /></Layout>
  </ProtectedRoute>
} />
```

### Prisma Includes Pattern
Always include role+permissions when fetching users:
```typescript
await prisma.user.findUnique({
  where: { id: userId },
  include: {
    role: {
      include: { permissions: true }
    }
  }
});
```
This is critical for authorization checks to work.

### Navigation Structure
Defined in `frontend/src/config/navigation.ts` with hierarchical menu items. Icons from `lucide-react`. Each item has optional `href`, `items` (children), and `icon`.

## Key Integration Points

### Prisma Export Pattern
Backend uses singleton: `export const prisma = new PrismaClient()` in `backend/src/index.ts`. All route files import this shared instance.

### CORS Configuration
Hardcoded to `http://localhost:5173` in `backend/src/index.ts`. Production deployments must update this to match frontend domain.

### JWT Utilities
- `backend/src/utils/jwt.ts`: `generateToken()`, `verifyToken()`
- `backend/src/utils/password.ts`: `hashPassword()`, `verifyPassword()`

### Frontend Context Pattern
`AuthContext` is the single source of truth for user state. Components use `useAuth()` hook, never access localStorage directly.

## Common Pitfalls

1. **Forgot .js extension**: Backend imports will fail at runtime
2. **Missing permission seed**: New resources need permissions added to `seed.ts`
3. **Route ordering**: Dynamic routes (`:id`) must come after static routes (`/roles/all` before `/:id`)
4. **Token expiry**: Frontend doesn't auto-refresh yet - users must re-login after 7 days
5. **Prisma type mismatch**: Role IDs are `Int`, warehouse IDs are `String @default(cuid())`

## Testing & Debugging
- Health check: `http://localhost:3001/health`
- API explorer: Use Prisma Studio to inspect database state
- Frontend errors: Check browser console for API call failures
- Backend errors: Terminal running `npm run dev` shows Express logs
