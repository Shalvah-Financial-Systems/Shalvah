'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { SearchableSelect } from './ui/searchable-select'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { usePlans } from '@/hooks/usePlans'
import { useAlertModal } from '@/hooks/useAlertModal'
import { AdminUser, CreateUserData, UpdateUserData, Plan } from '@/types'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: AdminUser
  isEditing?: boolean
}

export function UserModal({ isOpen, onClose, user, isEditing = false }: UserModalProps) {
  const { createUser, updateUser, loading } = useAdminUsers()
  const { plans, loadPlans } = usePlans()
  const { showAlert } = useAlertModal()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cnpj: '',
    planId: '',
    active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      // Carregar planos apenas se não foram carregados ainda
      if (plans.length === 0) {
        loadPlans()
      }
      if (isEditing && user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '',
          cnpj: user.cnpj || '',
          planId: user.planId || '',
          active: user.active || true
        })
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          cnpj: '',
          planId: '',
          active: true
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, user, plans.length, loadPlans])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.planId) {
      newErrors.planId = 'Plano é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (isEditing && user) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          type: 'ENTERPRISE',
          cnpj: formData.cnpj || undefined,
          planId: formData.planId
        }

        await updateUser(user.id, updateData)
        showAlert({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      } else {
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          type: 'ENTERPRISE',
          cnpj: formData.cnpj || undefined,
          planId: formData.planId
        }

        await createUser(createData)
        showAlert({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso!',
          type: 'info',
          confirmText: 'OK',
          onConfirm: () => {}
        })
      }
      onClose()
    } catch (error: any) {
      showAlert({
        title: 'Erro',
        description: error.message || 'Erro ao salvar usuário',
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

  const planOptions = plans.map(plan => ({
    value: plan.id,
    label: plan.name
  }))

  const statusOptions = [
    { value: 'true', label: 'Ativo' },
    { value: 'false', label: 'Inativo' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Usuário Empresarial' : 'Novo Usuário Empresarial'}
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">
              {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="planId">Plano *</Label>
            <SearchableSelect
              options={planOptions}
              value={formData.planId}
              onValueChange={(value) => handleInputChange('planId', value)}
              placeholder="Selecione o plano"
            />
            {errors.planId && <p className="text-red-500 text-sm mt-1">{errors.planId}</p>}
          </div>

          <div>
            <Label htmlFor="active">Status *</Label>
            <SearchableSelect
              options={statusOptions}
              value={formData.active.toString()}
              onValueChange={(value) => handleInputChange('active', value === 'true')}
              placeholder="Selecione o status"
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
