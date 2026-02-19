import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

/**
 * Authorization middleware factory for checking user permissions
 * @param resource - The resource to check (e.g., 'warehouse', 'supplier', 'item')
 * @param action - The action to check (e.g., 'create', 'read', 'update', 'delete')
 */
export function authorize(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get user's role with permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user || !user.role) {
        res.status(403).json({ error: 'User role not found' });
        return;
      }

      // Check if user has the required permission
      const hasPermission = user.role.permissions.some(
        (permission) => permission.resource === resource && permission.action === action
      );

      if (!hasPermission) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          required: { resource, action },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Check if user has any of the specified roles
 * @param roles - Array of role names to check against
 */
export function hasRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: true,
        },
      });

      if (!user || !user.role) {
        res.status(403).json({ error: 'User role not found' });
        return;
      }

      if (!roles.includes(user.role.name)) {
        res.status(403).json({ 
          error: 'Insufficient role privileges',
          required: roles,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Role check failed' });
    }
  };
}

/**
 * Check if user is the owner of a resource or has admin privileges
 * @param getResourceOwnerId - Function to extract owner ID from request
 */
export function isOwnerOrAdmin(getResourceOwnerId: (req: Request) => number | Promise<number>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if user has admin role
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: true,
        },
      });

      if (!user || !user.role) {
        res.status(403).json({ error: 'User role not found' });
        return;
      }

      // Admin users can access any resource
      if (user.role.name === 'admin') {
        next();
        return;
      }

      // Check if user is the owner
      const resourceOwnerId = await getResourceOwnerId(req);
      if (req.user.userId === resourceOwnerId) {
        next();
        return;
      }

      res.status(403).json({ error: 'Access denied: not the owner' });
    } catch (error) {
      console.error('Owner check error:', error);
      res.status(500).json({ error: 'Owner check failed' });
    }
  };
}
