import React, { useEffect, useState } from 'react';
import { Permission } from '../../types/role';
import { apiService } from '../../services/api';

interface PermissionFormProps {
  permission?: Permission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(permission?.name || '');
  const [description, setDescription] = useState(permission?.description || '');
  const [resource, setResource] = useState(permission?.resource || '');
  const [action, setAction] = useState(permission?.action || 'read');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(permission?.name || '');
    setDescription(permission?.description || '');
    setResource(permission?.resource || '');
    setAction(permission?.action || 'read');
  }, [isOpen, permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (permission && permission.id) {
        await apiService.updatePermission(permission.id, { name, description, resource, action });
      } else {
        await apiService.createPermission({ name, description, resource, action });
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save permission:', err);
      alert('Failed to save permission');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-12 mx-auto p-6 border border-slate-700 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">{permission ? 'Edit Permission' : 'Create Permission'}</h2>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Resource</label>
              <input
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                required
                placeholder="e.g., warehouse, supplier"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

export default PermissionForm;
