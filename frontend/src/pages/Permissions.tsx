import React, { useState } from 'react';
import PermissionList from '../components/permissions/PermissionList';
import PermissionForm from '../components/permissions/PermissionForm';
import DeleteConfirmation from '../components/permissions/DeleteConfirmation';
import { Permission } from '../types/role';
import { apiService } from '../services/api';

const Permissions: React.FC = () => {
  const [selected, setSelected] = useState<Permission | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Permission | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (perm: Permission) => {
    setSelected(perm);
    setIsFormOpen(true);
  };

  const handleDelete = (perm: Permission) => {
    setToDelete(perm);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await apiService.deletePermission(toDelete.id);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to delete permission:', err);
      alert('Failed to delete permission');
    }
    setIsDeleteOpen(false);
    setToDelete(null);
  };

  const handleSave = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 md:px-8">
      <div className="w-full mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white mb-2">Permission Management</h1>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Permission
            </button>
          </div>
          <p className="mt-2 text-slate-400 text-lg">Manage system permissions</p>
        </div>

        <PermissionList
          refreshTrigger={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PermissionForm
          permission={selected}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />

        <DeleteConfirmation
          permission={toDelete!}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Permissions;