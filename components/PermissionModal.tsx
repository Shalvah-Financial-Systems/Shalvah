'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { usePermissions } from '@/hooks/usePermissions'
import { useAlertModal } from '@/hooks/useAlertModal'
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types'

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  permission?: Permission
  isEditing?: boolean
}

export function PermissionModal({ isOpen, onClose, permission, isEditing = false }: PermissionModalProps) {
  const { createPermission, updatePermission, loading } = usePermissions()
  const { showAlert } = useAlertModal()

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && permission) {
        setFormData({
          name: permission.name,
          description: permission.description || ''
        })
      } else {
        setFormData({
          name: '',
          description: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, permission])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (isEditing && permission) {
        const updateData: UpdatePermissionData = {
          name: formData.name,
          description: formData.description || undefined
        }

        await updatePermission(permission.id, updateData)
        showAlert({
          title: 'Sucesso',
          description: 'Permissão atualizada com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      } else {
        const createData: CreatePermissionData = {
          name: formData.name,
          description: formData.description || undefined
        }

        await createPermission(createData)
        showAlert({
          title: 'Sucesso',
          description: 'Permissão criada com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      }
      onClose()
    } catch (error: any) {
      showAlert({
        title: 'Erro',
        description: error.message || 'Erro ao salvar permissão',
        type: 'danger',
        confirmText: 'OK',
        onConfirm: () => {}
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Permissão' : 'Nova Permissão'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Ex: CRIAR_USUARIO, EDITAR_PRODUTO, etc."
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Descrição da permissão..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
