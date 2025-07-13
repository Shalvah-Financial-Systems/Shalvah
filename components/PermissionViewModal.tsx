'use client'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Permission } from '@/types'

interface PermissionViewModalProps {
  isOpen: boolean
  onClose: () => void
  permission?: Permission
}

export function PermissionViewModal({ isOpen, onClose, permission }: PermissionViewModalProps) {
  if (!isOpen || !permission) return null

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
          <h2 className="text-lg font-semibold">Detalhes da Permissão</h2>
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
            <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">{permission.name}</p>
          </div>

          {permission.description && (
            <div>
              <label className="font-medium text-gray-700">Descrição</label>
              <p className="text-gray-900">{permission.description}</p>
            </div>
          )}

          <div>
            <label className="font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge variant={permission.active ? 'default' : 'secondary'}>
                {permission.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-700">Data de Criação</label>
            <p className="text-gray-900">{formatDate(permission.createdAt)}</p>
          </div>

          <div>
            <label className="font-medium text-gray-700">Última Atualização</label>
            <p className="text-gray-900">{formatDate(permission.updatedAt)}</p>
          </div>

          {permission.plans && permission.plans.length > 0 && (
            <div>
              <label className="font-medium text-gray-700">Planos que incluem esta permissão</label>
              <div className="mt-2 space-y-2">
                {permission.plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        {plan.description && (
                          <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                        )}
                        <p className="text-gray-700 font-medium text-sm">
                          R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Badge variant={plan.active ? 'default' : 'secondary'}>
                        {plan.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total: {permission.plans.length} planos
              </p>
            </div>
          )}

          {(!permission.plans || permission.plans.length === 0) && (
            <div>
              <label className="font-medium text-gray-700">Planos</label>
              <p className="text-gray-500">Esta permissão não está associada a nenhum plano</p>
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
