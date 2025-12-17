const chatbotService = require('../services/chatbotService');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const ShippingInfo = require('../models/ShippingInfo');
const logger = require('../utils/logger');

/**
 * Controller xử lý chatbot tư vấn đơn hàng
 */

/**
 * Xử lý tin nhắn chat từ người dùng
 * GET /buyers/chatbot/chat?message=...
 * POST /buyers/chatbot/chat { message: "..." }
 */
const handleChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const userMessage = req.body.message || req.query.message;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi'
      });
    }

    // Lấy thông tin đơn hàng của người dùng
    const orders = await Order.find({ buyerId: userId })
      .sort({ orderDate: -1 })
      .limit(10) // Lấy 10 đơn hàng gần nhất
      .populate('addressId')
      .lean();

    // Lấy chi tiết order items cho mỗi đơn hàng
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate({
            path: 'productId',
            select: 'title image price description'
          })
          .lean();

        // Lấy thông tin thanh toán
        const payment = await Payment.findOne({ orderId: order._id })
          .lean();

        // Lấy thông tin vận chuyển
        const orderItems = await OrderItem.find({ orderId: order._id }).lean();
        const shippingInfos = await ShippingInfo.find({
          orderItemId: { $in: orderItems.map(item => item._id) }
        }).lean();

        return {
          ...order,
          items,
          payment: payment ? {
            method: payment.method,
            status: payment.status,
            amount: payment.amount,
            transactionId: payment.transactionId,
            paidAt: payment.paidAt
          } : null,
          shippingInfos: shippingInfos.length > 0 ? shippingInfos.map(si => ({
            trackingNumber: si.trackingNumber,
            status: si.status,
            carrier: si.carrier,
            estimatedArrival: si.estimatedArrival
          })) : []
        };
      })
    );

    // Gọi chatbot service để xử lý tin nhắn
    const result = await chatbotService.processChat(userMessage, ordersWithItems);

    // Log transaction
    logger.info(`[Chatbot Controller] User: ${userId}, Message: ${userMessage.substring(0, 100)}, Transaction ID: ${result.transactionId || 'N/A'}`);

    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.response,
      transactionId: result.transactionId,
      responseTime: result.responseTime,
      ...(result.error && { error: result.error })
    });

  } catch (error) {
    logger.error(`[Chatbot Controller] Error: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.',
      error: error.message
    });
  }
};

/**
 * Lấy lịch sử chat (nếu có lưu trữ)
 * Hiện tại chỉ trả về thông báo
 */
const getChatHistory = async (req, res) => {
  try {
    // Có thể mở rộng để lưu lịch sử chat vào database sau
    return res.status(200).json({
      success: true,
      message: 'Tính năng lịch sử chat sẽ được cập nhật sớm',
      history: []
    });
  } catch (error) {
    logger.error(`[Chatbot Controller] Get history error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy lịch sử chat.',
      error: error.message
    });
  }
};

module.exports = {
  handleChat,
  getChatHistory
};
