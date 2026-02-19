import express, { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

// Validation
const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissionIds: z.array(z.number().int()).optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.number().int()).optional(),
});

/**
 * GET /api/roles
 * List roles (including permissions)
 */
router.get('/', authenticate, authorize('roles', 'read'), async (req: Request, res: Response) => {
  try {
    // Pagination, sorting and filtering
    const {
      page = '1',
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc',
      search = '',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * perPage;
    const take = perPage;

    // Build where clause
    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    // Build orderBy
    const orderBy: any = {};
    const sortableFields = ['name'];
    if (!sortableFields.includes(sortBy)) {
      orderBy.name = sortOrder as 'asc' | 'desc';
    } else {
      orderBy[sortBy as string] = sortOrder as 'asc' | 'desc';
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: { permissions: true },
        orderBy,
        skip,
        take,
      }),
      prisma.role.count({ where }),
    ]);

    res.json({
      roles,
      pagination: {
        page: pageNum,
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * GET /api/roles/permissions/all
 * Return all available permissions
 */
router.get('/permissions/all', authenticate, authorize('roles', 'read'), async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: { resource: 'asc' } });
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

/**
 * GET /api/roles/:id
 */
router.get('/:id', authenticate, authorize('roles', 'read'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: { permissions: true },
    });

    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

/**
 * POST /api/roles
 */
router.post('/', authenticate, authorize('roles', 'create'), async (req: Request, res: Response) => {
  try {
    const validated = createRoleSchema.parse(req.body);

    // Check unique name
    const existing = await prisma.role.findUnique({ where: { name: validated.name } });
    if (existing) {
      res.status(400).json({ error: 'Role with this name already exists' });
      return;
    }

    const permissionsConnect = (validated.permissionIds || []).map((id) => ({ id }));

    const role = await prisma.role.create({
      data: {
        name: validated.name,
        description: validated.description,
        permissions: {
          connect: permissionsConnect,
        },
      },
      include: { permissions: true },
    });

    res.status(201).json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

/**
 * PUT /api/roles/:id
 */
router.put('/:id', authenticate, authorize('roles', 'update'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateRoleSchema.parse(req.body);

    const existing = await prisma.role.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;

    if (validated.permissionIds) {
      // Set permissions to provided list
      await prisma.role.update({
        where: { id: Number(id) },
        data: {
          permissions: { set: validated.permissionIds.map((p) => ({ id: p })) },
        },
      });
    }

    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: updateData,
      include: { permissions: true },
    });

    res.json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * DELETE /api/roles/:id
 */
router.delete('/:id', authenticate, authorize('roles', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.role.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    await prisma.role.delete({ where: { id: Number(id) } });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
