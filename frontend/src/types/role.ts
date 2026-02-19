export interface Permission {
  id: number;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface RoleFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RoleListResponse {
  roles: RoleWithPermissions[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PermissionFilters {
  search?: string;
  resource?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}