import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { 
  createOrder,
  verifyPayment,
  fetchTransactions,
  clearError,
  setRazorpayOrderId,
  clearCurrentOrder,
  setProcessing
} from '../store/slices/paymentSlice';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const usePayments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payments);
  const authState = useSelector((state: RootState) => state.auth);

  const createPaymentOrder = useCallback(
    (items: Array<{
      documentId: string;
      documentTypeId: string;
      tier: string;
      quantity: number;
    }>) => {
      return dispatch(createOrder(items));
    },
    [dispatch]
  );

  const initiateRazorpayPayment = useCallback(
    (orderData: {
      id: string;
      amount: number;
      currency: string;
    }) => {
      return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error('Razorpay SDK not loaded'));
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'UDIN Services',
          description: 'Document Processing Payment',
          order_id: orderData.id,
          prefill: {
            name: authState.user ? `${authState.user.firstName} ${authState.user.lastName}` : '',
            email: authState.user?.email || '',
            contact: authState.user?.phone || '',
          },
          theme: {
            color: '#6366f1',
          },
          handler: async (response: any) => {
            try {
              dispatch(setProcessing(true));
              const result = await dispatch(verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }));
              
              if (result.meta.requestStatus === 'fulfilled') {
                resolve(result.payload);
              } else {
                reject(new Error('Payment verification failed'));
              }
            } catch (error) {
              reject(error);
            } finally {
              dispatch(setProcessing(false));
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    },
    [dispatch, authState.user]
  );

  const fetchUserTransactions = useCallback(
    (filters?: {
      type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      return dispatch(fetchTransactions(filters || {}));
    },
    [dispatch]
  );

  const clearPaymentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setOrderId = useCallback(
    (orderId: string) => {
      dispatch(setRazorpayOrderId(orderId));
    },
    [dispatch]
  );

  const clearOrder = useCallback(() => {
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  return {
    ...paymentState,
    createPaymentOrder,
    initiateRazorpayPayment,
    fetchUserTransactions,
    clearPaymentError,
    setOrderId,
    clearOrder,
  };
};