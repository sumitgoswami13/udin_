import { razorpayInstance, createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay';
import { Order, IOrder } from '../models/Order';
import { Transaction } from '../models/Transaction';
import { Document } from '../models/Document';
import { PricingCalculator } from '../../shared/pricing';

export class PaymentService {
  static async createOrder(
    userId: string,
    items: Array<{
      documentId: string;
      documentTypeId: string;
      tier: string;
      quantity: number;
    }>
  ) {
    try {
      // Calculate order total
      const orderCalculation = PricingCalculator.calculateOrderTotal(
        items.map(item => ({
          documentTypeId: item.documentTypeId,
          tier: item.tier,
          quantity: item.quantity,
        }))
      );

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(orderCalculation.totalAmount);

      // Create order in database
      const order = new Order({
        userId,
        items: items.map((item, index) => ({
          documentId: item.documentId,
          documentType: item.documentTypeId,
          tier: item.tier,
          quantity: item.quantity,
          unitPrice: orderCalculation.breakdown[index]?.unitPrice || 0,
          totalPrice: orderCalculation.breakdown[index]?.totalPrice || 0,
        })),
        subtotal: orderCalculation.subtotal,
        bulkDiscount: orderCalculation.bulkDiscount,
        gstAmount: orderCalculation.gstAmount,
        totalAmount: orderCalculation.totalAmount,
        razorpayOrderId: razorpayOrder.id,
        paymentMethod: 'razorpay',
      });

      await order.save();

      // Update documents with order reference
      await Document.updateMany(
        { _id: { $in: items.map(item => item.documentId) } },
        { orderId: order._id }
      );

      return {
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ) {
    try {
      // Verify signature
      const isValidSignature = verifyRazorpaySignature(orderId, paymentId, signature);
      
      if (!isValidSignature) {
        throw new Error('Invalid payment signature');
      }

      // Find order
      const order = await Order.findOne({ razorpayOrderId: orderId });
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status
      order.status = 'paid';
      order.razorpayPaymentId = paymentId;
      order.razorpaySignature = signature;
      order.paymentDate = new Date();
      await order.save();

      // Update documents payment status
      await Document.updateMany(
        { orderId: order._id },
        { paymentStatus: 'paid' }
      );

      // Create transaction record
      const transaction = new Transaction({
        userId: order.userId,
        orderId: order._id,
        type: 'payment',
        amount: order.totalAmount,
        status: 'completed',
        paymentMethod: 'razorpay',
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        description: `Payment for order ${order.orderNumber}`,
        processedAt: new Date(),
      });

      await transaction.save();

      return { order, transaction };
    } catch (error) {
      throw error;
    }
  }

  static async handlePaymentFailure(
    orderId: string,
    failureReason: string
  ) {
    try {
      const order = await Order.findOne({ razorpayOrderId: orderId });
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status
      order.status = 'failed';
      order.failureReason = failureReason;
      await order.save();

      // Update documents payment status
      await Document.updateMany(
        { orderId: order._id },
        { paymentStatus: 'failed' }
      );

      // Create failed transaction record
      const transaction = new Transaction({
        userId: order.userId,
        orderId: order._id,
        type: 'payment',
        amount: order.totalAmount,
        status: 'failed',
        paymentMethod: 'razorpay',
        razorpayOrderId: orderId,
        description: `Failed payment for order ${order.orderNumber}`,
        failureReason,
        processedAt: new Date(),
      });

      await transaction.save();

      return { order, transaction };
    } catch (error) {
      throw error;
    }
  }

  static async getUserTransactions(
    userId: string,
    filters?: {
      type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const query: any = { userId };

      if (filters?.type && filters.type !== 'all') {
        query.type = filters.type;
      }
      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      }

      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .populate('orderId', 'orderNumber items')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Transaction.countDocuments(query),
      ]);

      return {
        transactions,
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

  static async processRefund(
    orderId: string,
    refundAmount: number,
    reason: string
  ) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'paid') {
        throw new Error('Cannot refund unpaid order');
      }

      // Create refund with Razorpay
      const refund = await razorpayInstance.payments.refund(
        order.razorpayPaymentId!,
        {
          amount: Math.round(refundAmount * 100), // Convert to paise
          notes: { reason },
        }
      );

      // Update order
      order.status = 'refunded';
      order.refundId = refund.id;
      order.refundAmount = refundAmount;
      order.refundDate = new Date();
      await order.save();

      // Update documents
      await Document.updateMany(
        { orderId: order._id },
        { paymentStatus: 'refunded' }
      );

      // Create refund transaction
      const transaction = new Transaction({
        userId: order.userId,
        orderId: order._id,
        type: 'refund',
        amount: -refundAmount, // Negative amount for refund
        status: 'completed',
        paymentMethod: 'razorpay',
        description: `Refund for order ${order.orderNumber}: ${reason}`,
        metadata: { refundId: refund.id },
        processedAt: new Date(),
      });

      await transaction.save();

      return { order, transaction, refund };
    } catch (error) {
      throw error;
    }
  }
}