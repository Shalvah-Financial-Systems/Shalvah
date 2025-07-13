'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PlansTable } from '@/components/PlansTable'
import { PlanModal } from '@/components/PlanModal'
import { PlanViewModal } from '@/components/PlanViewModal'
import { AlertModal } from '@/components/AlertModal'
import { usePlans } from '@/hooks/usePlans'
import { useAlertModal } from '@/hooks/useAlertModal'
import { Plan } from '@/types'

export default function PlansPage() {
  const { plans, loadPlans, loading } = usePlans()
  const { isOpen, config, isLoading, closeAlert, confirmAlert } = useAlertModal()

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>()
  const [isEditing, setIsEditing] = useState(false)

  const handleNewPlan = () => {
    setSelectedPlan(undefined)
    setIsEditing(false)
    setIsPlanModalOpen(true)
  }

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsEditing(true)
    setIsPlanModalOpen(true)
  }

  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsViewModalOpen(true)
  }

  const handleClosePlanModal = () => {
    setIsPlanModalOpen(false)
    setSelectedPlan(undefined)
    setIsEditing(false)
    loadPlans()
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedPlan(undefined)
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
                Gerenciar Planos
              </h1>
              <p className="text-gray-600 mt-1">
                Administre os planos do sistema
              </p>
            </div>
            <Button
              onClick={handleNewPlan}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </div>

          {/* Plans Table */}
          <PlansTable
            plans={plans}
            loading={loading}
            onEdit={handleEditPlan}
            onView={handleViewPlan}
          />

          {/* Modals */}
          <PlanModal
            isOpen={isPlanModalOpen}
            onClose={handleClosePlanModal}
            plan={selectedPlan}
            isEditing={isEditing}
          />

          <PlanViewModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            plan={selectedPlan}
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
