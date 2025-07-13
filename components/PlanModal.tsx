'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { CurrencyInput } from './ui/currency-input'
import { usePlans } from '@/hooks/usePlans'
import { usePermissions } from '@/hooks/usePermissions'
import { useAlertModal } from '@/hooks/useAlertModal'
import { Plan, CreatePlanData, UpdatePlanData, Permission } from '@/types'

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  plan?: Plan
  isEditing?: boolean
}

export function PlanModal({ isOpen, onClose, plan, isEditing = false }: PlanModalProps) {
  const { createPlan, updatePlan, loading } = usePlans()
  const { permissions, loadPermissions } = usePermissions()
  const { showAlert } = useAlertModal()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    permissionIds: [] as string[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      // Carregar permissões apenas se não foram carregadas ainda
      if (permissions.length === 0) {
        loadPermissions()
      }
      if (isEditing && plan) {
        setFormData({
          name: plan.name,
          description: plan.description || '',
          price: plan.price,
          permissionIds: plan.permissions?.map(p => p.id) || []
        })
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          permissionIds: []
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, plan, permissions.length, loadPermissions])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (isEditing && plan) {
        const updateData: UpdatePlanData = {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          permissionIds: formData.permissionIds
        }

        await updatePlan(plan.id, updateData)
        showAlert({
          title: 'Sucesso',
          description: 'Plano atualizado com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      } else {
        const createData: CreatePlanData = {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          permissionIds: formData.permissionIds
        }

        await createPlan(createData)
        showAlert({
          title: 'Sucesso',
          description: 'Plano criado com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      }
      onClose()
    } catch (error: any) {
      showAlert({
        title: 'Erro',
        description: error.message || 'Erro ao salvar plano',
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

  const handlePermissionToggle = (permissionId: string) => {
    const currentPermissions = formData.permissionIds
    const isSelected = currentPermissions.includes(permissionId)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        permissionIds: currentPermissions.filter(id => id !== permissionId)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissionIds: [...currentPermissions, permissionId]
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Plano' : 'Novo Plano'}
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
              placeholder="Descrição do plano..."
            />
          </div>

          <div>
            <Label htmlFor="price">Preço *</Label>
            <CurrencyInput
              value={formData.price}
              onChange={(value) => handleInputChange('price', value)}
              className={errors.price ? 'border-red-500' : ''}
              showCurrencySymbol={true}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <Label>Permissões</Label>
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {permissions.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma permissão disponível</p>
              ) : (
                <div className="space-y-2">
                  {permissions.map((permission: Permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{permission.name}</div>
                        {permission.description && (
                          <div className="text-gray-600 text-xs">{permission.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formData.permissionIds.length} permissões selecionadas
            </p>
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
