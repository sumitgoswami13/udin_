import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  uploadDocumentValidation,
  updateDocumentStatusValidation,
  paginationValidation,
  handleValidationErrors 
} from '../middleware/validation';
import { uploadDocument, uploadSignedDocument, handleUploadError } from '../middleware/upload';

const router = Router();

// User routes
router.post(
  '/upload',
  authenticateToken,
  uploadDocument.single('document'),
  uploadDocumentValidation,
  handleValidationErrors,
  handleUploadError,
  DocumentController.uploadDocument
);

router.get(
  '/',
  authenticateToken,
  paginationValidation,
  handleValidationErrors,
  DocumentController.getUserDocuments
);

router.get(
  '/:documentId',
  authenticateToken,
  DocumentController.getDocumentById
);

router.delete(
  '/:documentId',
  authenticateToken,
  DocumentController.deleteDocument
);

router.get(
  '/:documentId/download',
  authenticateToken,
  DocumentController.downloadDocument
);

// Admin routes
router.get(
  '/admin/all',
  authenticateToken,
  requireAdmin,
  paginationValidation,
  handleValidationErrors,
  DocumentController.getAdminDocuments
);

router.patch(
  '/admin/:documentId/status',
  authenticateToken,
  requireAdmin,
  updateDocumentStatusValidation,
  handleValidationErrors,
  DocumentController.updateDocumentStatus
);

router.post(
  '/admin/:documentId/signed',
  authenticateToken,
  requireAdmin,
  uploadSignedDocument.single('signedDocument'),
  handleUploadError,
  DocumentController.uploadSignedDocument
);

export default router;