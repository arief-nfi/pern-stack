import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import rolesRoutes from './roles.js';
import permissionsRoutes from './permissions.js';


const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// User management routes
router.use('/users', userRoutes);

// Role management routes
router.use('/roles', rolesRoutes);

// Permission management routes
router.use('/permissions', permissionsRoutes);

// Define your other routes here

export default router;
