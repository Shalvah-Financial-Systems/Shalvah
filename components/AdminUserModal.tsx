'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { SearchableSelect } from './ui/searchable-select'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { usePlans } from '@/hooks/usePlans'
import { useAlertModal } from '@/hooks/useAlertModal'
import { AdminUser, UpdateUserData, Plan } from '@/types'
import api from '@/lib/api'
import { toast } from 'sonner'

interface AdminUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: AdminUser
  isEditing?: boolean
}

export function AdminUserModal({ isOpen, onClose, user, isEditing = false }: AdminUserModalProps) {
  const { updateUser, loadUsers } = useAdminUsers()
  const { plans, loadPlans } = usePlans()
  const { showAlert } = useAlertModal()
  
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'ENTERPRISE' as 'ENTERPRISE' | 'ADMIN',
    cnpj: '',
    planId: '',
    active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '',
          type: user.type,
          cnpj: user.cnpj || '',
          planId: user.planId || '',
          active: user.active || true
        })
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          type: 'ENTERPRISE',
          cnpj: '',
          planId: '',
          active: true
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, user])

  // Separar o carregamento de planos em um useEffect independente
  useEffect(() => {
    if (isOpen && formData.type === 'ENTERPRISE' && plans.length === 0) {
      loadPlans()
    }
  }, [isOpen, formData.type, plans.length, loadPlans])

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

    // Plano é obrigatório apenas para usuários ENTERPRISE
    if (formData.type === 'ENTERPRISE' && !formData.planId) {
      newErrors.planId = 'Plano é obrigatório para usuários empresariais'
    }

    // CNPJ é obrigatório apenas para usuários ENTERPRISE
    if (formData.type === 'ENTERPRISE' && !formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório para usuários empresariais'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isEditing && user) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          type: formData.type,
          cnpj: formData.type === 'ENTERPRISE' ? formData.cnpj || undefined : undefined,
          planId: formData.type === 'ENTERPRISE' ? formData.planId : undefined
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
        // Criar usuário via endpoint auth/register
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          type: formData.type,
          cnpj: formData.type === 'ENTERPRISE' ? formData.cnpj || undefined : undefined,
          planId: formData.type === 'ENTERPRISE' ? formData.planId : undefined
        }

        await api.post('/auth/register', createData)
        
        // Recarregar a lista de usuários para mostrar o novo usuário
        await loadUsers()
        
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
        description: error.response?.data?.message || error.message || 'Erro ao salvar usuário',
        type: 'danger',
        confirmText: 'OK',
        onConfirm: () => {}
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Se mudou o tipo para ADMIN, limpar campos específicos de ENTERPRISE
      if (field === 'type') {
        if (value === 'ADMIN') {
          newData.cnpj = ''
          newData.planId = ''
        }
      }
      
      return newData
    })
    
    // Carregar planos quando mudar para ENTERPRISE
    if (field === 'type' && value === 'ENTERPRISE' && plans.length === 0) {
      loadPlans()
    }
    
    // Limpar erro do campo específico
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  const planOptions = plans.map(plan => ({
    value: plan.id,
    label: plan.name
  }))

  const typeOptions = [
    { value: 'ENTERPRISE', label: 'Empresa' },
    { value: 'ADMIN', label: 'Administrador' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Nome completo"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="usuario@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Usuário *</Label>
            <SearchableSelect
              options={typeOptions}
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              placeholder="Selecione o tipo"
            />
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Campos específicos para ENTERPRISE */}
          {formData.type === 'ENTERPRISE' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  className={errors.cnpj ? 'border-red-500' : ''}
                  placeholder="00.000.000/0000-00"
                />
                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planId">Plano *</Label>
                <SearchableSelect
                  options={planOptions}
                  value={formData.planId}
                  onValueChange={(value) => handleInputChange('planId', value)}
                  placeholder="Selecione o plano"
                />
                {errors.planId && <p className="text-red-500 text-sm mt-1">{errors.planId}</p>}
              </div>
            </>
          )}

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
              placeholder={isEditing ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
