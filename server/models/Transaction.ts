import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  userId: string;
  orderId: string;
  transactionId: string;
  type: 'payment' | 'refund' | 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'razorpay' | 'manual' | 'wallet';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  description: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    ref: 'Order',
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'manual', 'wallet'],
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
  },
  razorpaySignature: {
    type: String,
    sparse: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ status: 1 });

// Generate transaction ID before saving
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);