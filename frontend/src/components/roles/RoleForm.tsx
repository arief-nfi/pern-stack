import React, { useEffect, useState } from 'react';
import { RoleWithPermissions, Permission } from '../../types/role';
import { apiService } from '../../services/api';
import PermissionTree from './PermissionTree';

interface RoleFormProps {
  role?: RoleWithPermissions | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(role?.permissions.map(p => p.id) || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(role?.name || '');
    setDescription(role?.description || '');
    setSelectedPermissions(role?.permissions.map(p => p.id) || []);

    const fetchPermissions = async () => {
      try {
        const perms = await apiService.getAllPermissions();
        setAvailablePermissions(perms);
      } catch (err) {
        console.error('Failed to load permissions:', err);
      }
    };

    fetchPermissions();
  }, [isOpen, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role && role.id) {
        await apiService.updateRole(role.id, { name, description, permissionIds: selectedPermissions });
      } else {
        await apiService.createRole({ name, description, permissionIds: selectedPermissions });
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save role:', err);
      alert('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-12 mx-auto p-6 border border-slate-700 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">{role ? 'Edit Role' : 'Create Role'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Permissions</label>
              <PermissionTree
                permissions={availablePermissions}
                selectedIds={selectedPermissions}
                onSelectionChange={setSelectedPermissions}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-base font-medium rounded-md shadow-sm hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
