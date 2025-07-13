'use client';

import { EnterpriseLayout } from '@/components/EnterpriseLayout';
import FormularioTransacao from '@/components/FormularioTransacao';
import { motion } from 'framer-motion';

export default function NovaTransacaoPage() {
  return (
    <EnterpriseLayout>
      <FormularioTransacao />
    </EnterpriseLayout>
  );
}
