import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TruncatedText } from '@/components/ui/truncated-text';
import { OverflowSafeText } from '@/components/ui/overflow-safe-text';

interface RecentUsersProps {
  users: {
    id: string;
    name: string;
    email: string;
    type: 'ADMIN' | 'ENTERPRISE';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
  }[];
}

export function RecentUsers({ users }: RecentUsersProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-4 w-full min-w-0">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                    <OverflowSafeText 
                      className="text-sm font-medium leading-none"
                      title={user.name}
                    >
                      {user.name}
                    </OverflowSafeText>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Badge 
                      variant={user.type === 'ADMIN' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {user.type === 'ADMIN' ? 'Admin' : 'Empresa'}
                    </Badge>
                    <Badge 
                      variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário recente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
