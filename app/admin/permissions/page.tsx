'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from 'components/ui/button'
import { Plus } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAlertModal } from '@/hooks/useAlertModal'
import { Permission } from '@/types'
import { AlertModal } from 'components/AlertModal'
import { PermissionModal } from 'components/PermissionModal'
import { PermissionsTable } from 'components/PermissionsTable'
import { PermissionViewModal } from 'components/PermissionViewModal'

export default function PermissionsPage() {
  const { permissions, loadPermissions, loading } = usePermissions()
  const { isOpen, config, isLoading, closeAlert, confirmAlert } = useAlertModal()

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | undefined>()
  const [isEditing, setIsEditing] = useState(false)

  const handleNewPermission = () => {
    setSelectedPermission(undefined)
    setIsEditing(false)
    setIsPermissionModalOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsEditing(true)
    setIsPermissionModalOpen(true)
  }

  const handleViewPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsViewModalOpen(true)
  }

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false)
    setSelectedPermission(undefined)
    setIsEditing(false)
    loadPermissions()
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedPermission(undefined)
  }

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
                Gerenciar Permissões
              </h1>
              <p className="text-gray-600 mt-1">
                Administre as permissões do sistema
              </p>
            </div>
            <Button
              onClick={handleNewPermission}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Permissão
            </Button>
          </div>

          {/* Permissions Table */}
          <PermissionsTable
            permissions={permissions}
            loading={loading}
            onEdit={handleEditPermission}
            onView={handleViewPermission}
          />

          {/* Modals */}
          <PermissionModal
            isOpen={isPermissionModalOpen}
            onClose={handleClosePermissionModal}
            permission={selectedPermission}
            isEditing={isEditing}
          />

          <PermissionViewModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            permission={selectedPermission}
          />

          <AlertModal
            isOpen={isOpen}
            onClose={closeAlert}
            onConfirm={confirmAlert}
            title={config?.title || ''}
            description={config?.description || ''}
            type={config?.type}
            confirmText={config?.confirmText}
            cancelText={config?.cancelText}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  )
}
