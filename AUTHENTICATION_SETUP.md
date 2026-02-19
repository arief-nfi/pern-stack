# Authentication and Authorization Setup Guide

This guide explains how to set up and use the authentication and authorization system implemented for the Nimbus application.

## Overview

The application uses:
- **JWT (JSON Web Tokens)** for authentication
- **RBAC (Role-Based Access Control)** for authorization
- **bcrypt** for password hashing
- **Prisma** for database management

## Backend Setup

### 1. Environment Configuration

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nimbus_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Server
PORT=3001

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 2. Database Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed the database** (creates default roles, permissions, and admin user):
   ```bash
   npm run db:seed
   ```

### 3. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Frontend Setup

### 1. Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL="http://localhost:3001/api"
```

### 2. Install Dependencies and Start

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Default User Account

After seeding the database, you can use the following default admin account:

- **Email**: admin@example.com
- **Password**: Admin@123

## User Roles and Permissions

### Roles

1. **Admin**: Full access to all resources and actions
2. **Manager**: Read and write access (no delete permissions)
3. **Viewer**: Read-only access

### Permissions

Permissions are defined per resource and action:
- **Resources**: warehouse, supplier, item, uom, inventory, purchase_order
- **Actions**: create, read, update, delete

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Protected Resources

All other API endpoints are protected and require:
- Valid JWT token in `Authorization: Bearer <token>` header
- Appropriate permissions for the requested resource/action

## Frontend Usage

### Authentication Context

Use the `useAuth` hook in your components:

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
  
  // Check if user has specific permission
  const canCreateWarehouse = hasPermission('warehouse', 'create');
  
  // Login
  const handleLogin = async () => {
    await login({ email, password });
  };
  
  // Logout
  const handleLogout = () => {
    logout();
  };
};
```

### Protected Routes

Wrap routes with `ProtectedRoute` component:

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/warehouse" element={
  <ProtectedRoute requiredPermission={{ resource: 'warehouse', action: 'read' }}>
    <Warehouse />
  </ProtectedRoute>
} />
```

## Database Scripts

The following npm scripts are available for database management:

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database and re-run migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:deploy` - Deploy migrations (for production)

## Security Considerations

1. **JWT Secret**: Always use a strong, unique JWT secret in production
2. **Database URL**: Use environment variables for sensitive data
3. **Password Policy**: Enforce strong passwords (minimum 8 characters, uppercase, lowercase, numbers, special characters)
4. **HTTPS**: Use HTTPS in production to protect tokens in transit
5. **Token Expiration**: Set appropriate token expiration times

## Troubleshooting

### Common Issues

1. **"Invalid or expired token"**:
   - Check if the backend server is running
   - Verify JWT_SECRET is the same on all restarts
   - Token might have expired, try logging in again

2. **"Database connection failed"**:
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check database exists and is accessible

3. **"Permission denied"**:
   - Check if user has the required role
   - Verify permissions are correctly assigned to roles
   - Ensure you're using the correct resource/action names

### Reset Everything

If you need to start fresh:

```bash
# Backend
cd backend
npm run db:reset
npm run db:seed
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## Next Steps

1. Customize the user roles and permissions based on your application needs
2. Implement additional authentication features (password reset, email verification, etc.)
3. Add audit logging for security-sensitive operations
4. Implement rate limiting for authentication endpoints
5. Add multi-factor authentication for enhanced security