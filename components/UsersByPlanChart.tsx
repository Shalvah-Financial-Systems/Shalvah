import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UsersByPlanChartProps {
  data: {
    planName: string;
    userCount: number;
    planId: string;
  }[];
}

export function UsersByPlanChart({ data }: UsersByPlanChartProps) {
  const total = data.reduce((sum, item) => sum + item.userCount, 0);
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários por Plano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.userCount / total) * 100 : 0;
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={item.planId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span className="text-sm font-medium">{item.planName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{item.userCount}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
