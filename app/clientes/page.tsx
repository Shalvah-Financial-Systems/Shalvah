'use client';

import { EnterpriseLayout } from '@/components/EnterpriseLayout';
import { ClientsTable } from '@/components/ClientsTable';
import { motion } from 'framer-motion';

export default function ClientsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os clientes da sua empresa
            </p>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <ClientsTable />
      </motion.div>
    </EnterpriseLayout>
  );
}
