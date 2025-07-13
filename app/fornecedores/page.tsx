'use client';

import { EnterpriseLayout } from '@/components/EnterpriseLayout';
import { SuppliersTable } from '@/components/SuppliersTable';
import { motion } from 'framer-motion';

export default function SuppliersPage() {
  return (
    <EnterpriseLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os fornecedores da sua empresa
            </p>
          </div>
        </div>

        {/* Tabela de Fornecedores */}
        <SuppliersTable />
      </motion.div>
    </EnterpriseLayout>
  );
}
