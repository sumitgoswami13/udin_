import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  documentId: string;
  documentType: string;
  tier: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  _id: string;
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  bulkDiscount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: 'razorpay' | 'manual';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentDate?: Date;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  refundDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  documentId: {
    type: String,
    required: true,
    ref: 'Document',
  },
  documentType: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    required: true,
    enum: ['Standard', 'Express', 'Premium'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  bulkDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  gstAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'manual'],
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
  },
  razorpaySignature: {
    type: String,
    sparse: true,
  },
  paymentDate: {
    type: Date,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  refundId: {
    type: String,
    sparse: true,
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  refundDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
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
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ status: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);