import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  createOrderValidation,
  verifyPaymentValidation,
  paginationValidation,
  handleValidationErrors 
} from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for payment routes
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 payment requests per windowMs
  message: {
    success: false,
    message: 'Too many payment requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment routes
router.post(
  '/create-order',
  authenticateToken,
  paymentLimiter,
  createOrderValidation,
  handleValidationErrors,
  PaymentController.createOrder
);

router.post(
  '/verify',
  verifyPaymentValidation,
  handleValidationErrors,
  PaymentController.verifyPayment
);

router.post(
  '/failure',
  PaymentController.handlePaymentFailure
);

router.get(
  '/transactions',
  authenticateToken,
  paginationValidation,
  handleValidationErrors,
  PaymentController.getUserTransactions
);

// Admin routes
router.post(
  '/admin/refund',
  authenticateToken,
  requireAdmin,
  PaymentController.processRefund
);

// Webhook route (no auth required)
router.post('/webhook/razorpay', PaymentController.razorpayWebhook);

export default router;