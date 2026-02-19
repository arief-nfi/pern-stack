import express, { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

const createPermissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  resource: z.string().min(1),
  action: z.string().min(1),
});

const updatePermissionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  resource: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
});

/**
 * GET /api/permissions
 * Server-side pagination, sorting and filtering
 */
router.get('/', authenticate, authorize('permissions', 'read'), async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc',
      search = '',
      resource = '',
      action = '',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * perPage;
    const take = perPage;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (resource) {
      where.resource = { equals: String(resource), mode: 'insensitive' };
    }

    if (action) {
      where.action = { equals: String(action), mode: 'insensitive' };
    }

    const orderBy: any = {};
    const sortableFields = ['name', 'resource', 'action'];
    if (!sortableFields.includes(sortBy)) {
      orderBy.name = sortOrder as 'asc' | 'desc';
    } else {
      orderBy[sortBy] = sortOrder as 'asc' | 'desc';
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({ where, orderBy, skip, take }),
      prisma.permission.count({ where }),
    ]);

    res.json({ permissions, pagination: { page: pageNum, limit: perPage, total, pages: Math.ceil(total / perPage) || 1 } });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

/**
 * GET /api/permissions/:id
 */
router.get('/:id', authenticate, authorize('permissions', 'read'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const perm = await prisma.permission.findUnique({ where: { id: Number(id) } });
    if (!perm) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }
    res.json(perm);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
});

/**
 * POST /api/permissions
 */
router.post('/', authenticate, authorize('permissions', 'create'), async (req: Request, res: Response) => {
  try {
    const validated = createPermissionSchema.parse(req.body);

    // Unique name check
    const existing = await prisma.permission.findUnique({ where: { name: validated.name } });
    if (existing) {
      res.status(400).json({ error: 'Permission with this name already exists' });
      return;
    }

    const permission = await prisma.permission.create({ data: validated });
    res.status(201).json(permission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

/**
 * PUT /api/permissions/:id
 */
router.put('/:id', authenticate, authorize('permissions', 'update'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updatePermissionSchema.parse(req.body);

    const existing = await prisma.permission.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }

    if (validated.name && validated.name !== existing.name) {
      const nameTaken = await prisma.permission.findUnique({ where: { name: validated.name } });
      if (nameTaken) {
        res.status(400).json({ error: 'Permission name already taken' });
        return;
      }
    }

    const permission = await prisma.permission.update({ where: { id: Number(id) }, data: validated });
    res.json(permission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error updating permission:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

/**
 * DELETE /api/permissions/:id
 */
router.delete('/:id', authenticate, authorize('permissions', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.permission.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }

    await prisma.permission.delete({ where: { id: Number(id) } });
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ error: 'Failed to delete permission' });
  }
});

export default router;
