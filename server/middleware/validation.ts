import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    body: z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      email: z.string().email('Invalid email format'),
      phone: z.string().min(10, 'Phone number must be at least 10 digits'),
      address: z.string().min(5, 'Address must be at least 5 characters'),
      state: z.string().min(2, 'State is required'),
      pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),
  
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
  
  createOrder: z.object({
    body: z.object({
      documents: z.array(z.object({
        documentTypeId: z.string(),
        tier: z.string(),
        quantity: z.number().min(1),
      })),
      amount: z.number().min(1),
    }),
  }),
  
  updateDocumentStatus: z.object({
    body: z.object({
      status: z.enum(['uploaded', 'downloaded_by_admin', 'in_review', 'signed_uploaded', 'completed', 'error']),
      notes: z.string().optional(),
    }),
    params: z.object({
      documentId: z.string().uuid(),
    }),
  }),
};