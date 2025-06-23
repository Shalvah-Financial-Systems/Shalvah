export interface User {
  id: string;
  email: string;
  cnpj?: string;
  name: string;
  type: "ENTERPRISE" | "ADMIN";
}

export interface Transaction {
  id: string;
  type: "entrada" | "saida";
  value: number;
  date: string;
  description: string;
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateTransactionData {
  type: "RECEITA" | "DESPESA";
  value: number;
  date: string;
  description: string;
  category: string;
}

export interface MEIConfig {
  monthlyRevenue: number;
  dasValue: number;
}
