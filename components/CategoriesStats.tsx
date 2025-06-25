'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types';
import { Tag, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoriesStatsProps {
  categories: Category[];
  loading: boolean;
}

export function CategoriesStats({ categories, loading }: CategoriesStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalCategories = categories.length;
  const categoriesWithDescription = categories.filter(cat => cat.description).length;
  
  // Calcular categoria mais recente
  const mostRecentCategory = categories.reduce((latest, current) => {
    return new Date(current.createdAt) > new Date(latest?.createdAt || 0) ? current : latest;
  }, categories[0]);

  const stats = [
    {
      title: 'Total de Categorias',
      value: totalCategories,
      description: 'Categorias criadas',
      icon: Tag,
      color: 'bg-blue-500',
    },
    {
      title: 'Com Descrição',
      value: categoriesWithDescription,
      description: `${categoriesWithDescription} de ${totalCategories} categorias`,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Mais Recente',
      value: mostRecentCategory?.name || '-',
      description: mostRecentCategory 
        ? `Criada em ${new Date(mostRecentCategory.createdAt).toLocaleDateString('pt-BR')}`
        : 'Nenhuma categoria',
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
