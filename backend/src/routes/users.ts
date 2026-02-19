import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorization.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all roles for user management (must be before /:id routes)
router.get('/roles/all', authenticate, async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get all users with pagination, sorting, and filtering
router.get('/', authenticate, authorize('users', 'read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      role = '',
      isActive = ''
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause for filtering
    const where: any = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Filter by role
    if (role) {
      where.roleId = Number(role);
    }

    // Filter by active status
    if (isActive !== '') {
      where.isActive = isActive === 'true';
    }

    // Build order clause
    const orderBy: any = {};

    // Validate and map sortable fields. If sorting by role, use nested orderBy on role.name
    const sortableFields = ['name', 'email', 'createdAt', 'isActive', 'role'];

    if (!sortableFields.includes(sortBy as string)) {
      // Fallback to createdAt if invalid sort field is provided
      orderBy.createdAt = sortOrder as string;
    } else if (sortBy === 'role' || sortBy === 'role.name') {
      // Prisma nested orderBy for relation field
      orderBy.role = { name: sortOrder as 'asc' | 'desc' };
    } else {
      orderBy[sortBy as string] = sortOrder as string;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      users: usersWithoutPassword,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, authorize('users', 'read'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticate, authorize('users', 'create'), async (req, res) => {
  try {
    const { email, name, password, roleId, isActive = true } = req.body;

    // Validate required fields
    if (!email || !password || !roleId) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: Number(roleId) }
    });

    if (!role) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId: Number(roleId),
        isActive
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, authorize('users', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, password, roleId, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      });

      if (emailTaken) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Check if role exists (if provided)
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: Number(roleId) }
      });

      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    // Build update data
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (roleId !== undefined) updateData.roleId = Number(roleId);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('users', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
