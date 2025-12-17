import { api } from '../../services/index';

/**
 * Service để gọi API chatbot tư vấn đơn hàng
 */
class ChatbotService {
  /**
   * Gửi tin nhắn đến chatbot
   * @param {string} message - Nội dung tin nhắn
   * @returns {Promise} Response từ chatbot
   */
  async sendMessage(message) {
    try {
      const response = await api.post('/buyers/chatbot/chat', {
        message: message
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.'
      );
    }
  }

  /**
   * Lấy lịch sử chat (placeholder cho tương lai)
   * @returns {Promise} Lịch sử chat
   */
  async getChatHistory() {
    try {
      const response = await api.get('/buyers/chatbot/history');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        'Đã xảy ra lỗi khi lấy lịch sử chat.'
      );
    }
  }
}

export default new ChatbotService();
