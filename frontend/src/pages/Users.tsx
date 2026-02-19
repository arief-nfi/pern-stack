import React, { useState } from 'react';
import { User } from '../types/user';
import { apiService } from '../services/api';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import DeleteConfirmation from '../components/users/DeleteConfirmation';
import { Plus } from 'lucide-react';

const Users: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await apiService.deleteUser(userToDelete.id);
        // Refresh the list by triggering a re-render
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
    setIsDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUser = () => {
    // Refresh the list by triggering a re-render
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 md:px-8">
      <div className="w-full mx-auto space-y-6 ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        <UserList
          refreshTrigger={refreshKey}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />

        <UserForm
          user={selectedUser}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveUser}
        />

        <DeleteConfirmation
          user={userToDelete!}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Users;
