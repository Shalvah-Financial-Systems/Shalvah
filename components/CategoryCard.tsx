'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onShowDeleteAlert: (categoryName: string, onConfirm: () => void) => void;
  index?: number;
}

export function CategoryCard({ 
  category, 
  onEdit, 
  onDelete, 
  onShowDeleteAlert,
  index = 0 
}: CategoryCardProps) {
  const handleDelete = () => {
    onShowDeleteAlert(category.name, () => onDelete(category.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
            <span className="truncate">{category.name}</span>
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                title="Editar categoria"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                title="Excluir categoria"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {category.description && (
          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm line-clamp-2">
              {category.description}
            </p>
          </CardContent>
        )}
        
        <CardContent className="pt-2 text-xs text-gray-400">
          Criada em: {new Date(category.createdAt).toLocaleDateString('pt-BR')}
        </CardContent>
      </Card>
    </motion.div>
  );
}
