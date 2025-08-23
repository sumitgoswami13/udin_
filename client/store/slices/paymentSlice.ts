import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentApi } from '../api/paymentApi';

interface Order {
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
}

interface Transaction {
  id: string;
  transactionId: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  paymentMethod: string;
  createdAt: string;
}

interface PaymentState {
  currentOrder: Order | null;
  transactions: Transaction[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  razorpayOrderId: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: PaymentState = {
  currentOrder: null,
  transactions: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  razorpayOrderId: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const createOrder = createAsyncThunk(
  'payments/createOrder',
  async (items: Array<{
    documentId: string;
    documentTypeId: string;
    tier: string;
    quantity: number;
  }>, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createOrder({ items });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.verifyPayment(paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'payments/fetchTransactions',
  async (filters: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getUserTransactions(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRazorpayOrderId: (state, action: PayloadAction<string>) => {
      state.razorpayOrderId = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.razorpayOrderId = null;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        state.razorpayOrderId = action.payload.razorpayOrder.id;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        if (state.currentOrder) {
          state.currentOrder.status = 'paid';
        }
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setRazorpayOrderId, 
  clearCurrentOrder, 
  setProcessing 
} = paymentSlice.actions;

export default paymentSlice.reducer;