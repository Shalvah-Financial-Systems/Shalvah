'use client'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plan } from '@/types'

interface PlanViewModalProps {
  isOpen: boolean
  onClose: () => void
  plan?: Plan
}

export function PlanViewModal({ isOpen, onClose, plan }: PlanViewModalProps) {
  if (!isOpen || !plan) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalhes do Plano</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium text-gray-700">Nome</label>
            <p className="text-gray-900">{plan.name}</p>
          </div>

          <div>
            <label className="font-medium text-gray-700">Preço</label>
            <p className="text-gray-900 text-lg font-semibold">
              R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {plan.description && (
            <div>
              <label className="font-medium text-gray-700">Descrição</label>
              <p className="text-gray-900">{plan.description}</p>
            </div>
          )}

          <div>
            <label className="font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge variant={plan.active ? 'default' : 'secondary'}>
                {plan.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-700">Data de Criação</label>
            <p className="text-gray-900">{formatDate(plan.createdAt)}</p>
          </div>

          <div>
            <label className="font-medium text-gray-700">Última Atualização</label>
            <p className="text-gray-900">{formatDate(plan.updatedAt)}</p>
          </div>

          {plan.permissions && plan.permissions.length > 0 && (
            <div>
              <label className="font-medium text-gray-700">Permissões Incluídas</label>
              <div className="mt-2 space-y-2">
                {plan.permissions.map((permission) => (
                  <div key={permission.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{permission.name}</h4>
                        {permission.description && (
                          <p className="text-gray-600 text-sm mt-1">{permission.description}</p>
                        )}
                      </div>
                      <Badge variant={permission.active ? 'default' : 'secondary'}>
                        {permission.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total: {plan.permissions.length} permissões
              </p>
            </div>
          )}

          {(!plan.permissions || plan.permissions.length === 0) && (
            <div>
              <label className="font-medium text-gray-700">Permissões</label>
              <p className="text-gray-500">Nenhuma permissão associada a este plano</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
