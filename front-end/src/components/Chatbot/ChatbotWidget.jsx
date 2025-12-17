import React, { useState, useRef, useEffect } from 'react';
import ChatbotService from '../../services/api/ChatbotService';
import { toast } from 'react-toastify';
import styles from './ChatbotWidget.module.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Prompt gợi ý khi mở chatbot lần đầu
  const suggestedPrompts = [
    'Tôi muốn kiểm tra đơn hàng của tôi',
    'Đơn hàng của tôi đang ở đâu?',
    'Trạng thái thanh toán như thế nào?',
    'Làm sao để theo dõi vận đơn?',
    'Tôi muốn hủy đơn hàng'
  ];

  // Khởi tạo với tin nhắn chào mừng
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          content: 'Xin chào! Tôi là trợ lý tư vấn đơn hàng. Tôi có thể giúp bạn kiểm tra đơn hàng, trạng thái thanh toán, vận chuyển và các thông tin khác. Bạn muốn hỏi gì?',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus vào input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();

    if (!textToSend) return;

    // Thêm tin nhắn người dùng
    const userMessage = {
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Gọi API chatbot
      const response = await ChatbotService.sendMessage(textToSend);

      if (response.success) {
        // Thêm tin nhắn bot
        const botMessage = {
          type: 'bot',
          content: response.message,
          timestamp: new Date(),
          transactionId: response.transactionId
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.message || 'Không thể nhận phản hồi từ chatbot');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        type: 'bot',
        content: error.message || 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset messages khi mở lại
      setMessages([]);
    }
  };

  return (
    <div className={styles.chatbotWidgetContainer}>
      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatbotWindow}>
          {/* Header */}
          <div className={styles.chatbotHeader}>
            <div className={styles.chatbotHeaderContent}>
              <div className={styles.chatbotAvatar}>🤖</div>
              <div className={styles.chatbotTitle}>
                <h3>Trợ lý đơn hàng</h3>
                <span className={styles.chatbotStatus}>Đang trực tuyến</span>
              </div>
            </div>
            <button
              className={styles.chatbotCloseBtn}
              onClick={toggleChat}
              aria-label="Đóng chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatbotMessages}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.chatbotMessage} ${message.type === 'user' ? styles.userMessage : styles.botMessage} ${message.isError ? styles.errorMessage : ''}`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>
                <div className={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}

            {/* Suggested Prompts - chỉ hiển thị khi chưa có tin nhắn người dùng nào */}
            {messages.filter(m => m.type === 'user').length === 0 && messages.length === 1 && (
              <div className={styles.chatbotSuggestedPrompts}>
                <div className={styles.suggestedPromptsTitle}>Bạn có thể hỏi:</div>
                <div className={styles.suggestedPromptsList}>
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className={styles.suggestedPromptBtn}
                      onClick={() => handleSuggestedPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className={`${styles.chatbotMessage} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.chatbotInputContainer}>
            <input
              ref={inputRef}
              type="text"
              className={styles.chatbotInput}
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className={styles.chatbotSendBtn}
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={styles.chatbotToggleBtn}
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
