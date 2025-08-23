import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types/api';

export class DocumentController {
  static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentTypeId, tier } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const document = await DocumentService.uploadDocument(
        req.user!.id,
        {
          originalName: file.originalname,
          filename: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        },
        documentTypeId,
        tier
      );

      const response: ApiResponse = {
        success: true,
        message: 'Document uploaded successfully',
        data: { document },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Document upload error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Document upload failed',
      };

      res.status(500).json(response);
    }
  }

  static async getUserDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        paymentStatus: req.query.paymentStatus as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await DocumentService.getUserDocuments(req.user!.id, filters);

      const response: ApiResponse = {
        success: true,
        message: 'Documents retrieved successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Get documents error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve documents',
      };

      res.status(500).json(response);
    }
  }

  static async getDocumentById(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const document = await DocumentService.getDocumentById(documentId, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: 'Document retrieved successfully',
        data: { document },
      };

      res.json(response);
    } catch (error) {
      console.error('Get document error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Document not found',
      };

      res.status(404).json(response);
    }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const result = await DocumentService.deleteDocument(documentId, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.json(response);
    } catch (error) {
      console.error('Delete document error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete document',
      };

      res.status(400).json(response);
    }
  }

  static async downloadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const document = await DocumentService.getDocumentById(documentId, req.user!.id);

      // Set appropriate headers for file download
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      
      // In a real implementation, you would stream the file from storage
      res.json({
        success: true,
        message: 'Document download initiated',
        data: {
          downloadUrl: `/api/documents/${documentId}/file`,
          filename: document.originalName,
        },
      });
    } catch (error) {
      console.error('Download document error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Failed to download document',
      };

      res.status(404).json(response);
    }
  }

  // Admin methods
  static async getAdminDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        userId: req.query.userId as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await DocumentService.getAdminDocuments(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Documents retrieved successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Get admin documents error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve documents',
      };

      res.status(500).json(response);
    }
  }

  static async updateDocumentStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const { status, notes } = req.body;

      const document = await DocumentService.updateDocumentStatus(
        documentId,
        status,
        notes,
        req.user!.id
      );

      const response: ApiResponse = {
        success: true,
        message: 'Document status updated successfully',
        data: { document },
      };

      res.json(response);
    } catch (error) {
      console.error('Update document status error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update document status',
      };

      res.status(400).json(response);
    }
  }

  static async uploadSignedDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const { udinNumber } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No signed document uploaded',
        });
      }

      const document = await DocumentService.uploadSignedDocument(
        documentId,
        file.path,
        udinNumber
      );

      const response: ApiResponse = {
        success: true,
        message: 'Signed document uploaded successfully',
        data: { document },
      };

      res.json(response);
    } catch (error) {
      console.error('Upload signed document error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload signed document',
      };

      res.status(400).json(response);
    }
  }
}