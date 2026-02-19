import React, { useState } from 'react';
import RoleList from '../components/roles/RoleList';
import RoleForm from '../components/roles/RoleForm';
import DeleteConfirmation from '../components/roles/DeleteConfirmation';
import { RoleWithPermissions } from '../types/role';
import { apiService } from '../services/api';

const Roles: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = (role: RoleWithPermissions) => {
    setRoleToDelete(role);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await apiService.deleteRole(roleToDelete.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to delete role:', err);
      alert('Failed to delete role');
    }
    setIsDeleteOpen(false);
    setRoleToDelete(null);
  };

  const handleSave = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 md:px-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white mb-2">Role Management</h1>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Role
            </button>
          </div>
          <p className="mt-2 text-slate-400 text-lg">Manage roles and their permissions</p>
        </div>

        <RoleList
          refreshTrigger={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <RoleForm
          role={selectedRole}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />

        <DeleteConfirmation
          role={roleToDelete!}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Roles;
