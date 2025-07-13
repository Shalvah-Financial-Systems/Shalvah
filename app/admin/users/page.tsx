'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { AdminUsersTable } from '@/components/AdminUsersTable';
import { AdminUserModal } from '@/components/AdminUserModal';
import { UserViewModal } from '@/components/UserViewModal';
import { AdminUser } from '@/types';

export default function UsersPage() {
  const { users, loading } = useAdminUsers();
  
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const openCreateModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const openViewModal = (user: AdminUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const closeModals = () => {
    setUserModalOpen(false);
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-full px-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Usuários
              </h1>
              <p className="text-gray-600 mt-1">
                Administre os usuários do sistema
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          {/* Users Table */}
          <AdminUsersTable
            users={users}
            loading={loading}
            onEdit={openEditModal}
            onView={openViewModal}
          />

          {/* Modals */}
          <AdminUserModal
            isOpen={userModalOpen}
            onClose={closeModals}
            user={selectedUser || undefined}
            isEditing={!!selectedUser}
          />

          <UserViewModal
            isOpen={viewModalOpen}
            onClose={closeModals}
            user={selectedUser || undefined}
          />
        </motion.div>
      </div>
    </div>
  );
}
