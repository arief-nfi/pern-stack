export interface User {
  id: number;
  email: string;
  name: string | null;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
  roleId: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}