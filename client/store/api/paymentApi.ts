import { api, ApiResponse } from '../../utils/api';

export const paymentApi = {
  createOrder: (data: {
    items: Array<{
      documentId: string;
      documentTypeId: string;
      tier: string;
      quantity: number;
    }>;
  }): Promise<ApiResponse> => api.post('/payments/create-order', data),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse> => api.post('/payments/verify', data),

  handlePaymentFailure: (data: {
    orderId: string;
    reason: string;
  }): Promise<ApiResponse> => api.post('/payments/failure', data),

  getUserTransactions: (filters: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`/payments/transactions?${params.toString()}`);
  },

  processRefund: (data: {
    orderId: string;
    amount: number;
    reason: string;
  }): Promise<ApiResponse> => api.post('/payments/admin/refund', data),
};