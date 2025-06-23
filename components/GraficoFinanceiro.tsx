'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GraficoFinanceiroProps {
  income: number;
  expenses: number;
}

export function GraficoFinanceiro({ income, expenses }: GraficoFinanceiroProps) {
  const data = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: [
          '#3B82F6', // Azul para receitas
          '#F97316', // Laranja para despesas
        ],
        borderColor: [
          '#2563EB',
          '#EA580C',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {        callbacks: {
          label: function(context: { parsed: number; label: string }) {
            const value = context.parsed;
            return `${context.label}: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value)}`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
