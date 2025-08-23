export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface DocumentUploadResponse {
  document: {
    id: string;
    name: string;
    originalName: string;
    size: number;
    documentType: string;
    category: string;
    tier: string;
    cost: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export interface OrderResponse {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    items: Array<{
      documentId: string;
      documentType: string;
      tier: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
  };
}

export interface TransactionResponse {
  transactions: Array<{
    id: string;
    transactionId: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    paymentMethod: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}