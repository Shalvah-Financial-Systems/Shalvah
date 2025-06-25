'use client';

import { Sidebar } from '@/components/Sidebar';
import FormularioTransacao from '@/components/FormularioTransacao';
import { motion } from 'framer-motion';

export default function NovaTransacaoPage() {
  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormularioTransacao />
      </motion.div>
    </Sidebar>
  );
}
