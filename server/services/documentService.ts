import { Document, IDocument } from '../models/Document';
import { Order } from '../models/Order';
import { PricingCalculator } from '../../shared/pricing';
import path from 'path';
import fs from 'fs/promises';

export class DocumentService {
  static async uploadDocument(
    userId: string,
    fileData: {
      originalName: string;
      filename: string;
      mimeType: string;
      size: number;
      path: string;
    },
    documentTypeId: string,
    tier: string = 'Standard'
  ) {
    try {
      // Calculate cost
      const cost = PricingCalculator.calculateDocumentPrice(documentTypeId, tier, 1);
      
      // Create document record
      const document = new Document({
        userId,
        name: fileData.filename,
        originalName: fileData.originalName,
        mimeType: fileData.mimeType,
        size: fileData.size,
        filePath: fileData.path,
        documentType: documentTypeId,
        category: this.getCategoryFromDocumentType(documentTypeId),
        tier,
        cost,
        status: 'uploaded',
        paymentStatus: 'pending',
      });

      await document.save();
      return document;
    } catch (error) {
      throw error;
    }
  }

  static async getUserDocuments(
    userId: string,
    filters?: {
      status?: string;
      category?: string;
      paymentStatus?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const query: any = { userId };

      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      if (filters?.category && filters.category !== 'all') {
        query.category = filters.category;
      }
      if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
        query.paymentStatus = filters.paymentStatus;
      }

      const [documents, total] = await Promise.all([
        Document.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Document.countDocuments(query),
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getDocumentById(documentId: string, userId?: string) {
    try {
      const query: any = { _id: documentId };
      if (userId) {
        query.userId = userId;
      }

      const document = await Document.findOne(query);
      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    } catch (error) {
      throw error;
    }
  }

  static async updateDocumentStatus(
    documentId: string,
    status: string,
    adminNotes?: string,
    adminUserId?: string
  ) {
    try {
      const updateData: any = { status };
      
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      if (status === 'downloaded_by_admin') {
        updateData.downloadedByAdmin = true;
        updateData.adminDownloadDate = new Date();
      }

      if (status === 'in_review') {
        updateData.processingStartDate = new Date();
      }

      if (status === 'completed') {
        updateData.completionDate = new Date();
      }

      const document = await Document.findByIdAndUpdate(
        documentId,
        updateData,
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    } catch (error) {
      throw error;
    }
  }

  static async uploadSignedDocument(
    documentId: string,
    signedFilePath: string,
    udinNumber?: string
  ) {
    try {
      const updateData: any = {
        status: 'signed_uploaded',
        signedDocumentPath: signedFilePath,
        signedDocumentUploadDate: new Date(),
      };

      if (udinNumber) {
        updateData.udinNumber = udinNumber;
      }

      const document = await Document.findByIdAndUpdate(
        documentId,
        updateData,
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    } catch (error) {
      throw error;
    }
  }

  static async deleteDocument(documentId: string, userId: string) {
    try {
      const document = await Document.findOne({ _id: documentId, userId });
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Check if document can be deleted
      if (document.downloadedByAdmin || document.paymentStatus === 'paid') {
        throw new Error('Cannot delete document that has been processed or paid for');
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.filePath);
      } catch (fileError) {
        console.warn('File deletion warning:', fileError);
      }

      // Delete document record
      await Document.findByIdAndDelete(documentId);

      return { message: 'Document deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getAdminDocuments(filters?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      if (filters?.userId) {
        query.userId = filters.userId;
      }

      const [documents, total] = await Promise.all([
        Document.find(query)
          .populate('userId', 'firstName lastName email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Document.countDocuments(query),
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private static getCategoryFromDocumentType(documentTypeId: string): string {
    // Map document type to category
    const categoryMap: Record<string, string> = {
      'audit-statutory': 'audit',
      'audit-internal': 'audit',
      'audit-tax': 'audit',
      'audit-bank': 'audit',
      'cert-net-worth': 'certification',
      'cert-turnover': 'certification',
      'cert-income': 'certification',
      'cert-project': 'certification',
      'compliance-gst': 'compliance',
      'compliance-roc': 'compliance',
      'compliance-fema': 'compliance',
      'compliance-tds': 'compliance',
      'financial-due-diligence': 'financial',
      'financial-valuation': 'financial',
      'financial-loan': 'financial',
      'financial-merger': 'financial',
      'legal-agreement-review': 'legal',
      'legal-forensic': 'legal',
      'legal-expert-opinion': 'legal',
      'tax-itr-review': 'taxation',
      'tax-assessment': 'taxation',
      'tax-international': 'taxation',
      'company-incorporation': 'company',
      'company-annual-return': 'company',
      'company-closure': 'company',
      'other-training': 'other',
      'other-consultation': 'other',
    };

    return categoryMap[documentTypeId] || 'other';
  }
}