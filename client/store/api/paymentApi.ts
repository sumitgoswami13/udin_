import apiClient from './authApi';

export const paymentApi = {
  createOrder: (data: {
    items: Array<{
      documentId: string;
      documentTypeId: string;
      tier: string;
      quantity: number;
    }>;
  }) => apiClient.post('/payments/create-order', data),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => apiClient.post('/payments/verify', data),

  handlePaymentFailure: (data: {
    orderId: string;
    reason: string;
  }) => apiClient.post('/payments/failure', data),

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
    
    return apiClient.get(`/payments/transactions?${params.toString()}`);
  },

  processRefund: (data: {
    orderId: string;
    amount: number;
    reason: string;
  }) => apiClient.post('/payments/admin/refund', data),
};