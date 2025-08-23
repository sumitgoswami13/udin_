import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  registerValidation, 
  loginValidation, 
  adminLoginValidation,
  handleValidationErrors 
} from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post('/register', authLimiter, registerValidation, handleValidationErrors, AuthController.register);
router.post('/login', loginLimiter, loginValidation, handleValidationErrors, AuthController.login);
router.post('/admin-login', authLimiter, adminLoginValidation, handleValidationErrors, AuthController.adminLogin);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;