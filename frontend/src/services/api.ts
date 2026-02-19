import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { UserListResponse, CreateUserRequest, UpdateUserRequest, Role } from '../types/user';
import { RoleWithPermissions, Permission, RoleListResponse } from '../types/role';

// Use relative URL to leverage Vite proxy in development
// In production, this will use the full URL from .env
const API_BASE_URL = '/api';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorObj: any = {};
      try {
        errorObj = errorText ? JSON.parse(errorText) : {};
      } catch (_) {
        errorObj = { message: errorText };
      }
      throw new Error(errorObj.error || errorObj.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    const text = await response.text().catch(() => '');
    if (!text) return null as any;

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      // Fallback if response is not JSON
      return text as any as T;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // User management endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    role?: string;
    isActive?: string;
  }): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request<UserListResponse>(endpoint);
  }

  async getUser(id: number): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/users/roles/all');
  }

  // Role management endpoints
  async getRolesList(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }): Promise<RoleListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/roles?${queryString}` : '/roles';

    return this.request<RoleListResponse>(endpoint);
  }

  async getRole(id: number): Promise<RoleWithPermissions> {
    return this.request<RoleWithPermissions>(`/roles/${id}`);
  }

  async createRole(data: { name: string; description?: string; permissionIds?: number[] }): Promise<RoleWithPermissions> {
    return this.request<RoleWithPermissions>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: number, data: { name?: string; description?: string; permissionIds?: number[] }): Promise<RoleWithPermissions> {
    return this.request<RoleWithPermissions>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.request<Permission[]>('/roles/permissions/all');
  }

  // Permission management endpoints
  async getPermissionsList(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    resource?: string;
    action?: string;
  }): Promise<{ permissions: Permission[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/permissions?${queryString}` : '/permissions';
    return this.request<{ permissions: Permission[]; pagination: { page: number; limit: number; total: number; pages: number } }>(endpoint);
  }

  async getPermission(id: number): Promise<Permission> {
    return this.request<Permission>(`/permissions/${id}`);
  }

  async createPermission(data: { name: string; description?: string; resource: string; action: string }): Promise<Permission> {
    return this.request<Permission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(id: number, data: { name?: string; description?: string; resource?: string; action?: string }): Promise<Permission> {
    return this.request<Permission>(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

   async deletePermission(id: number): Promise<{ message: string }> {
     return this.request<{ message: string }>(`/permissions/${id}`, {
       method: 'DELETE',
     });
   }
   
}

export const apiService = new ApiService();
