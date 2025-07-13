export interface User {
  id: string;
  email: string;
  cnpj?: string;
  name: string;
  type: "ENTERPRISE" | "ADMIN";
  planId?: string;
  plan?: Plan;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "COST";
  classification?: "EXPENSE" | "COST";
  typeExpense?: "FIXED" | "VARIABLE";
  value: number;
  date: string;
  description?: string;
  categoryId: string;
  category?: Category;
  productServiceId?: string;
  productService?: ProductsServices;
  clientId?: string;
  client?: Client;
  supplierId?: string;
  supplier?: Supplier;
  status?: 'ACTIVE' | 'CANCELLED';
  active?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: "INCOME" | "COST";
  classification?: "EXPENSE" | "COST";
  typeExpense?: "FIXED" | "VARIABLE";
  value: number;
  date: string;
  description?: string;
  categoryId: string;
  productServiceId?: string;
  clientId?: string;
  supplierId?: string;
}

export interface CreateTransactionData {
  type: "INCOME" | "COST";
  classification?: "EXPENSE" | "COST";
  typeExpense?: "FIXED" | "VARIABLE";
  value: number;
  date: string;
  description?: string;
  categoryId: string;
  productServiceId?: string;
  clientId?: string;
  supplierId?: string;
}

export interface UpdateTransactionData {
  type?: "INCOME" | "COST";
  classification?: "EXPENSE" | "COST";
  typeExpense?: "FIXED" | "VARIABLE";
  value?: number;
  date?: string;
  description?: string;
  categoryId?: string;
  productServiceId?: string;
  clientId?: string;
  supplierId?: string;
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

export interface ProductsServices {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: "PRODUCT" | "SERVICE";
  status?: 'ACTIVE' | 'INACTIVE';
  active?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  cpfCnpj?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  active?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  cnpj?: string;
  name: string;
  fantasyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  active?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ProductsServices DTOs
export interface CreateProductsServicesData {
  name: string;
  description?: string;
  price: number;
  type: "PRODUCT" | "SERVICE";
}

export interface UpdateProductsServicesData {
  name?: string;
  description?: string;
  price?: number;
  type?: "PRODUCT" | "SERVICE";
}

// Client DTOs
export interface CreateClientData {
  cpfCnpj?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UpdateClientData {
  cpfCnpj?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Supplier DTOs
export interface CreateSupplierData {
  cnpj?: string;
  name: string;
  fantasyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UpdateSupplierData {
  cnpj?: string;
  name?: string;
  fantasyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Admin Panel Types
export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  active?: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  plans?: Plan[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  cnpj?: string;
  name: string;
  type: "ENTERPRISE" | "ADMIN";
  profileType?: string;
  planId?: string;
  plan?: Plan;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Plan DTOs
export interface CreatePlanData {
  name: string;
  description?: string;
  price: number;
  permissionIds?: string[];
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  permissionIds?: string[];
}

// Permission DTOs
export interface CreatePermissionData {
  name: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
}

// User DTOs for Admin
export interface CreateUserData {
  email: string;
  name: string;
  cnpj?: string;
  type: "ENTERPRISE" | "ADMIN";
  profileType?: string;
  planId?: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  cnpj?: string;
  type?: "ENTERPRISE" | "ADMIN";
  profileType?: string;
  planId?: string;
}
