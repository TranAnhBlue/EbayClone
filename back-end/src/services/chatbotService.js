const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service xử lý chatbot tư vấn đơn hàng sử dụng Google Gemini API
 */
class ChatbotService {
  apiKey = 'AIzaSyDGgUNZ93C2ed2ls2_jHhj4ricq0Rbomwg';
  apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  maxRetries = 3;
  requestTimeout = 2000; // 2 giây như yêu cầu

  /**
   * Tạo system prompt với thông tin đơn hàng
   */
  createSystemPrompt(orderData) {
    let orderContext = '';

    if (orderData && Array.isArray(orderData) && orderData.length > 0) {
      try {
        orderContext = `
Thông tin đơn hàng của khách hàng:
${orderData.map((order, index) => {
          const itemsList = (order.items && Array.isArray(order.items) && order.items.length > 0)
            ? order.items.map(item => {
              const productTitle = item.productId?.title || item.productId || 'Sản phẩm';
              const quantity = item.quantity || 1;
              const unitPrice = item.unitPrice || 0;
              return `  - ${productTitle}: ${quantity} x ${unitPrice.toLocaleString('vi-VN')} VNĐ`;
            }).join('\n')
            : '  (Chưa có sản phẩm)';

          const orderId = order._id || order.id || 'N/A';
          const status = this.translateStatus(order.status || 'pending');
          const orderDate = order.orderDate || order.createdAt || new Date();
          const totalPrice = order.totalPrice || 0;
          const paymentInfo = order.payment ? `\n  - Phương thức thanh toán: ${order.payment.method || 'N/A'}\n  - Trạng thái thanh toán: ${order.payment.status === 'paid' ? 'Đã thanh toán' : order.payment.status === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}` : '';
          const shippingInfo = order.shippingInfos && order.shippingInfos.length > 0
            ? `\n  - Mã vận đơn: ${order.shippingInfos.map(si => si.trackingNumber).join(', ')}`
            : '';

          return `
Đơn hàng ${index + 1}:
  - Mã đơn hàng: ${orderId}
  - Trạng thái: ${status}
  - Ngày đặt: ${new Date(orderDate).toLocaleString('vi-VN')}
  - Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} VNĐ${paymentInfo}${shippingInfo}
  - Sản phẩm:
${itemsList}
`;
        }).join('\n')}`;
      } catch (error) {
        logger.error(`[Chatbot] Error creating order context: ${error.message}`);
        orderContext = 'Khách hàng có đơn hàng nhưng không thể đọc chi tiết.';
      }
    } else {
      orderContext = 'Khách hàng chưa có đơn hàng nào.';
    }

    return `Bạn là trợ lý tư vấn đơn hàng thông minh của một hệ thống thương mại điện tử. 
Nhiệm vụ của bạn là trả lời các câu hỏi về đơn hàng một cách thân thiện, chính xác và hữu ích bằng tiếng Việt.

${orderContext}

Hướng dẫn:
- Trả lời bằng tiếng Việt một cách tự nhiên và thân thiện
- Chỉ cung cấp thông tin dựa trên dữ liệu đơn hàng được cung cấp
- Nếu không có thông tin, hãy nói rõ ràng
- Giải thích các trạng thái đơn hàng một cách dễ hiểu
- Đề xuất các bước tiếp theo phù hợp (ví dụ: kiểm tra thanh toán, theo dõi vận chuyển)
- Giữ câu trả lời ngắn gọn, súc tích (tối đa 200 từ)
- Luôn lịch sự và chuyên nghiệp

Trạng thái đơn hàng có thể là:
- pending: Đang chờ thanh toán
- processing: Đang xử lý
- shipping: Đang vận chuyển
- in_transit: Đang trên đường
- out_for_delivery: Đang giao hàng
- delivered: Đã giao hàng thành công
- shipped: Đã xuất kho
- failed: Giao hàng thất bại
- rejected: Đơn hàng bị từ chối
- cancelled: Đơn hàng đã hủy
- returned: Đơn hàng đã trả lại`;
  }

  /**
   * Dịch trạng thái sang tiếng Việt
   */
  translateStatus(status) {
    const statusMap = {
      'pending': 'Đang chờ thanh toán',
      'processing': 'Đang xử lý',
      'shipping': 'Đang vận chuyển',
      'in_transit': 'Đang trên đường',
      'out_for_delivery': 'Đang giao hàng',
      'delivered': 'Đã giao hàng thành công',
      'shipped': 'Đã xuất kho',
      'failed': 'Giao hàng thất bại',
      'rejected': 'Đơn hàng bị từ chối',
      'cancelled': 'Đơn hàng đã hủy',
      'returned': 'Đơn hàng đã trả lại'
    };
    return statusMap[status] || status;
  }

  /**
   * Gọi Google Gemini API với retry logic
   */
  async callGeminiAPI(userMessage, orderData, retryCount = 0) {
    const startTime = Date.now();
    const transactionId = `chatbot_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    try {
      logger.info(`[Chatbot] Transaction ID: ${transactionId}, User message: ${userMessage.substring(0, 100)}...`);

      const systemPrompt = this.createSystemPrompt(orderData);
      const fullPrompt = `${systemPrompt}\n\nKhách hàng hỏi: ${userMessage}\n\nHãy trả lời:`;

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          timeout: this.requestTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const elapsedTime = Date.now() - startTime;
      const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.';

      logger.info(`[Chatbot] Transaction ID: ${transactionId}, Response time: ${elapsedTime}ms, Success`);

      return {
        success: true,
        response: botResponse,
        transactionId,
        responseTime: elapsedTime
      };

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      logger.error(`[Chatbot] Transaction ID: ${transactionId}, Error: ${error.message}, Response time: ${elapsedTime}ms`);

      // Retry logic nếu lỗi network hoặc timeout
      if ((error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.response?.status >= 500)
        && retryCount < this.maxRetries) {
        logger.info(`[Chatbot] Transaction ID: ${transactionId}, Retrying... (${retryCount + 1}/${this.maxRetries})`);
        await this.delay(500 * (retryCount + 1)); // Exponential backoff
        return this.callGeminiAPI(userMessage, orderData, retryCount + 1);
      }

      return {
        success: false,
        response: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
        transactionId,
        error: error.message,
        responseTime: elapsedTime
      };
    }
  }

  /**
   * Delay helper cho retry
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Xử lý chat với context đơn hàng
   */
  async processChat(userMessage, orderData) {
    try {
      if (!userMessage || userMessage.trim().length === 0) {
        return {
          success: false,
          response: 'Xin chào! Tôi có thể giúp gì cho bạn về đơn hàng?'
        };
      }

      const result = await this.callGeminiAPI(userMessage.trim(), orderData);
      return result;

    } catch (error) {
      logger.error(`[Chatbot] Unexpected error: ${error.message}`);
      return {
        success: false,
        response: 'Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
        error: error.message
      };
    }
  }
}

module.exports = new ChatbotService();
