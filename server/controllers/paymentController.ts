import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types/api';

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { items } = req.body;
      
      const result = await PaymentService.createOrder(req.user!.id, items);

      const response: ApiResponse = {
        success: true,
        message: 'Order created successfully',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create order error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      };

      res.status(500).json(response);
    }
  }

  static async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const result = await PaymentService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Payment verification error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
      };

      res.status(400).json(response);
    }
  }

  static async handlePaymentFailure(req: Request, res: Response) {
    try {
      const { orderId, reason } = req.body;

      const result = await PaymentService.handlePaymentFailure(orderId, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Payment failure handled',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Payment failure handling error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Failed to handle payment failure',
      };

      res.status(500).json(response);
    }
  }

  static async getUserTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        type: req.query.type as string,
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await PaymentService.getUserTransactions(req.user!.id, filters);

      const response: ApiResponse = {
        success: true,
        message: 'Transactions retrieved successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Get transactions error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve transactions',
      };

      res.status(500).json(response);
    }
  }

  static async processRefund(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId, amount, reason } = req.body;

      const result = await PaymentService.processRefund(orderId, amount, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Refund processed successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Process refund error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process refund',
      };

      res.status(400).json(response);
    }
  }

  static async razorpayWebhook(req: Request, res: Response) {
    try {
      const { event, payload } = req.body;

      switch (event) {
        case 'payment.captured':
          // Handle successful payment
          await PaymentService.verifyPayment(
            payload.payment.entity.order_id,
            payload.payment.entity.id,
            req.headers['x-razorpay-signature'] as string
          );
          break;

        case 'payment.failed':
          // Handle failed payment
          await PaymentService.handlePaymentFailure(
            payload.payment.entity.order_id,
            payload.payment.entity.error_description || 'Payment failed'
          );
          break;

        default:
          console.log('Unhandled webhook event:', event);
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ status: 'error' });
    }
  }
}