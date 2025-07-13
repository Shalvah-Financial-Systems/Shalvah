'use client'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TruncatedText } from './ui/truncated-text'
import { AdminUser } from '@/types'

interface UserViewModalProps {
  isOpen: boolean
  onClose: () => void
  user?: AdminUser
}

export function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
  if (!isOpen || !user) return null

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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalhes do Usuário</h2>
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
            <TruncatedText 
              text={user.name} 
              maxLength={50}
              className="text-gray-900 block"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          {user.cnpj && (
            <div>
              <label className="font-medium text-gray-700">CNPJ</label>
              <p className="text-gray-900">{user.cnpj}</p>
            </div>
          )}

          <div>
            <label className="font-medium text-gray-700">Tipo</label>
            <div className="mt-1">
              <Badge variant={user.type === 'ADMIN' ? 'destructive' : 'default'}>
                {user.type === 'ADMIN' ? 'Administrador' : 'Empresa'}
              </Badge>
            </div>
          </div>

          {user.plan && (
            <div>
              <label className="font-medium text-gray-700">Plano</label>
              <p className="text-gray-900">{user.plan.name}</p>
              {user.plan.description && (
                <p className="text-gray-600 text-sm">{user.plan.description}</p>
              )}
              <p className="text-gray-700 font-medium">
                R$ {user.plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div>
            <label className="font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge variant={user.active ? 'default' : 'secondary'}>
                {user.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-700">Data de Criação</label>
            <p className="text-gray-900">{formatDate(user.createdAt)}</p>
          </div>

          <div>
            <label className="font-medium text-gray-700">Última Atualização</label>
            <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
          </div>

          {user.plan?.permissions && user.plan.permissions.length > 0 && (
            <div>
              <label className="font-medium text-gray-700">Permissões do Plano</label>
              <div className="mt-2 space-y-1">
                {user.plan.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {permission.name}
                    </Badge>
                    {permission.description && (
                      <span className="text-gray-600 text-sm">{permission.description}</span>
                    )}
                  </div>
                ))}
              </div>
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
