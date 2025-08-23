import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  _id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  documentType: string;
  category: string;
  tier: 'Standard' | 'Express' | 'Premium';
  status: 'uploaded' | 'downloaded_by_admin' | 'in_review' | 'signed_uploaded' | 'completed' | 'error';
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  orderId?: string;
  adminNotes?: string;
  downloadedByAdmin: boolean;
  adminDownloadDate?: Date;
  signedDocumentPath?: string;
  signedDocumentUploadDate?: Date;
  processingStartDate?: Date;
  completionDate?: Date;
  udinNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true,
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
  },
  category: {
    type: String,
    required: [true, 'Document category is required'],
  },
  tier: {
    type: String,
    enum: ['Standard', 'Express', 'Premium'],
    default: 'Standard',
  },
  status: {
    type: String,
    enum: ['uploaded', 'downloaded_by_admin', 'in_review', 'signed_uploaded', 'completed', 'error'],
    default: 'uploaded',
  },
  cost: {
    type: Number,
    required: [true, 'Document cost is required'],
    min: [0, 'Cost cannot be negative'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    sparse: true,
  },
  orderId: {
    type: String,
    sparse: true,
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
  },
  downloadedByAdmin: {
    type: Boolean,
    default: false,
  },
  adminDownloadDate: {
    type: Date,
  },
  signedDocumentPath: {
    type: String,
  },
  signedDocumentUploadDate: {
    type: Date,
  },
  processingStartDate: {
    type: Date,
  },
  completionDate: {
    type: Date,
  },
  udinNumber: {
    type: String,
    trim: true,
    sparse: true,
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

// Indexes for performance
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ paymentStatus: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ orderId: 1 });

export const Document = mongoose.model<IDocument>('Document', documentSchema);