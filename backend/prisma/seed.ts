import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create permissions
  const permissions = await Promise.all([
    // User permissions
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'View users',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
    // Role permissions
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: {
        name: 'roles.create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: {
        name: 'roles.read',
        description: 'View roles',
        resource: 'roles',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: {
        name: 'roles.update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },
    }),
    // Permission management permissions
    prisma.permission.upsert({
      where: { name: 'permissions.create' },
      update: {},
      create: {
        name: 'permissions.create',
        description: 'Create permissions',
        resource: 'permissions',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.read' },
      update: {},
      create: {
        name: 'permissions.read',
        description: 'View permissions',
        resource: 'permissions',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.update' },
      update: {},
      create: {
        name: 'permissions.update',
        description: 'Update permissions',
        resource: 'permissions',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.delete' },
      update: {},
      create: {
        name: 'permissions.delete',
        description: 'Delete permissions',
        resource: 'permissions',
        action: 'delete',
      },
    }),
  ]);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      permissions: {
        set: permissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager with read/write access',
      permissions: {
        connect: permissions
          .filter((p) => !p.name.includes('.delete'))
          .map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Viewer with read-only access',
      permissions: {
        connect: permissions
          .filter((p) => p.action === 'read')
          .map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  // Create admin user
  const adminPassword = await hashPassword('Admin@123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Administrator',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log('');
  console.log('Default admin user:');
  console.log('  Email: admin@example.com');
  console.log('  Password: Admin@123');
  console.log('');
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
