export interface User {
  id: string;
  email: string;
  cnpj?: string;
  name: string;
  type: "ENTERPRISE" | "ADMIN";
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface Transaction {
  id: string;
  type: "entrada" | "saida";
  value: number;
  date: string;
  description: string;
  categoryId: string;
  category?: Category; // Categoria populada quando necessário
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: "entrada" | "saida";
  value: number;
  date: string;
  description: string;
  categoryId: string;
}

export interface CreateTransactionData {
  type: "entrada" | "saida";
  value: number;
  date: string;
  description: string;
  categoryId: string;
}

export interface UpdateTransactionData {
  type?: "entrada" | "saida";
  value?: number;
  date?: string;
  description?: string;
  categoryId?: string;
}

export interface MEIConfig {
  monthlyRevenue: number;
  dasValue: number;
}

export interface RegisterData {
  email: string;
  password: string;
  type: 'ADMIN' | 'ENTERPRISE';
  cnpj?: string;
  inscricaoEstadual?: string;
  name?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
}

export interface LoginCredentials {
  identifier: string; // email ou cnpj
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string; // Opcional, pois o token é salvo nos cookies
}
