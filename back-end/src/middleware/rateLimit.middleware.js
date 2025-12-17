const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Tạo rate limiter với cấu hình tùy chỉnh
 * @param {Object} options - Các tùy chọn cho rate limiter
 * @param {number} options.windowMs - Thời gian window tính bằng milliseconds
 * @param {number} options.max - Số lượng request tối đa trong window
 * @param {string} options.message - Thông báo lỗi khi vượt quá limit
 * @param {string} options.name - Tên của rate limiter (để log)
 */
const createRateLimiter = ({ windowMs, max, message, name = 'RateLimit' }) => {
  return rateLimit({
    windowMs, // Thời gian window (ví dụ: 15 phút)
    max, // Giới hạn mỗi IP có thể thực hiện bao nhiêu request trong window
    message: {
      success: false,
      message: message || 'Quá nhiều requests từ IP này, vui lòng thử lại sau.'
    },
    standardHeaders: true, // Trả về thông tin rate limit trong header `RateLimit-*`
    legacyHeaders: false, // Tắt header `X-RateLimit-*`
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${name}: IP ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        message: message || 'Quá nhiều requests từ IP này, vui lòng thử lại sau.',
        retryAfter: Math.ceil(windowMs / 1000) // Thời gian chờ tính bằng giây
      });
    },
    // Sử dụng IP thật nếu có proxy (tùy chọn)
    // skip: (req) => {
    //   // Có thể skip rate limit cho một số IP hoặc điều kiện đặc biệt
    //   return false;
    // }
  });
};

/**
 * Rate limiter nghiêm ngặt cho các route xác thực (login, register, forgot-password)
 * Giới hạn: 5 requests mỗi 15 phút từ mỗi IP
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 requests mỗi 15 phút
  message: 'Quá nhiều lần thử đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.',
  name: 'AuthRateLimit'
});

/**
 * Rate limiter vừa phải cho các API thông thường
 * Giới hạn: 100 requests mỗi 15 phút từ mỗi IP
 */
const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // 100 requests mỗi 15 phút
  message: 'Quá nhiều requests. Vui lòng thử lại sau.',
  name: 'GeneralRateLimit'
});

/**
 * Rate limiter cho các API có thể tốn tài nguyên (upload, tạo đơn hàng, thanh toán)
 * Giới hạn: 20 requests mỗi 15 phút từ mỗi IP
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // 20 requests mỗi 15 phút
  message: 'Quá nhiều requests cho các thao tác này. Vui lòng thử lại sau.',
  name: 'StrictRateLimit'
});

/**
 * Rate limiter rất nghiêm ngặt cho các API quan trọng (payment, order creation)
 * Giới hạn: 10 requests mỗi 15 phút từ mỗi IP
 */
const veryStrictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // 10 requests mỗi 15 phút
  message: 'Quá nhiều requests cho các thao tác quan trọng này. Vui lòng thử lại sau 15 phút.',
  name: 'VeryStrictRateLimit'
});

/**
 * Rate limiter linh hoạt cho các API công khai (xem sản phẩm, danh mục)
 * Giới hạn: 200 requests mỗi 15 phút từ mỗi IP
 */
const publicRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // 200 requests mỗi 15 phút
  message: 'Quá nhiều requests. Vui lòng thử lại sau.',
  name: 'PublicRateLimit'
});

module.exports = {
  authRateLimiter,
  generalRateLimiter,
  strictRateLimiter,
  veryStrictRateLimiter,
  publicRateLimiter,
  createRateLimiter
};



