const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { generalRateLimiter, strictRateLimiter, publicRateLimiter } = require('../middleware/rateLimit.middleware');

// Tạo mã vận đơn mới (chỉ seller)
router.post('/create-tracking', strictRateLimiter, authMiddleware, shippingController.createTrackingNumber);

// Cập nhật trạng thái vận chuyển (chỉ seller)
router.put('/update-status/:shippingInfoId', strictRateLimiter, authMiddleware, shippingController.updateShippingStatus);

// Lấy thông tin vận chuyển theo tracking number (public)
router.get('/track/:trackingNumber', publicRateLimiter, shippingController.getTrackingInfo);

// Lấy danh sách vận chuyển của seller
router.get('/seller-shipments', generalRateLimiter, authMiddleware, shippingController.getSellerShipments);

// Lấy thống kê vận chuyển của seller
router.get('/seller-stats', generalRateLimiter, authMiddleware, shippingController.getShippingStats);

// Lấy danh sách order items của seller để chọn tạo tracking
router.get('/seller-order-items', generalRateLimiter, authMiddleware, shippingController.getSellerOrderItems);

// Reset trạng thái đơn hàng từ cancelled về pending (cho test)
router.post('/reset-cancelled-orders', strictRateLimiter, authMiddleware, shippingController.resetCancelledOrders);

// Debug: Lấy tất cả shipping info của seller (cho debug)
router.get('/debug-shipping-info', generalRateLimiter, authMiddleware, shippingController.debugShippingInfo);

module.exports = router;
