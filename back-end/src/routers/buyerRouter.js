const express = require('express');
const { authMiddleware, isBuyer, isSellerOrBuyer } = require('../middleware/auth.middleware');
const { generalRateLimiter, strictRateLimiter, veryStrictRateLimiter } = require('../middleware/rateLimit.middleware');
const paymentController = require('../controllers/paymentController');
// ... (các controller khác giữ nguyên)
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');
const addressController = require('../controllers/addressController');
const { getVoucherByCode } = require('../controllers/voucherController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const disputeController = require('../controllers/disputeController');
const userController = require('../controllers/userController');
const returnRequestController = require('../controllers/returnRequestController');
const chatbotController = require('../controllers/chatbotController');

const buyerRouter = express.Router();

// --- SỬA Ở ĐÂY ---
// Public routes for payment callbacks (không yêu cầu xác thực, không áp dụng rate limit nghiêm ngặt)
// Route phải khớp với cấu hình trong paymentController
buyerRouter.get('/payments/paypal/callback', paymentController.paypalCallback);


// Protected routes (yêu cầu xác thực là buyer)
buyerRouter.use(generalRateLimiter);
buyerRouter.use(authMiddleware);

// User role management
buyerRouter.put('/change-role', authController.changeRole);

// Quản lý giỏ hàng
const cartRoutes = express.Router();
cartRoutes.use(isSellerOrBuyer);
cartRoutes.post('/add', strictRateLimiter, cartController.addToCart);
cartRoutes.get('/', cartController.viewCart);
cartRoutes.put('/update/:productId', strictRateLimiter, cartController.updateCartItem);
cartRoutes.delete('/remove/:productId', strictRateLimiter, cartController.deleteCartItem);
cartRoutes.post('/remove-multiple', strictRateLimiter, cartController.removeMultipleItems);
buyerRouter.use('/cart', cartRoutes);

// Address routes
buyerRouter.post('/addresses', strictRateLimiter, addressController.createAddress);
buyerRouter.get('/addresses', addressController.getAddresses);
buyerRouter.put('/addresses/:id', strictRateLimiter, addressController.updateAddress);
buyerRouter.delete('/addresses/:id', strictRateLimiter, addressController.deleteAddress);
buyerRouter.put('/addresses/:id/default', strictRateLimiter, addressController.setDefaultAddress);

// Voucher routes
buyerRouter.get('/vouchers/code/:code', getVoucherByCode);

// Quản lý đơn hàng
const orderRoutes = express.Router();
orderRoutes.use(isBuyer);
orderRoutes.post('/', veryStrictRateLimiter, orderController.createOrder);
orderRoutes.get('/', orderController.getBuyerOrders);
orderRoutes.get('/:id', orderController.getOrderDetails);
orderRoutes.put('/items/:id/status', strictRateLimiter, orderController.updateOrderItemStatus);
orderRoutes.put('/:id/cancel', strictRateLimiter, orderController.cancelOrder);
buyerRouter.use('/orders', orderRoutes);

// Quản lý thanh toán
const paymentRoutes = express.Router();
paymentRoutes.use(isBuyer);
paymentRoutes.post('/', veryStrictRateLimiter, paymentController.createPayment);
paymentRoutes.get('/status/:orderId', paymentController.checkPaymentStatus);
buyerRouter.use('/payments', paymentRoutes);

// Chatbot tư vấn đơn hàng
const chatbotRoutes = express.Router();
chatbotRoutes.use(isBuyer);
chatbotRoutes.post('/chat', strictRateLimiter, chatbotController.handleChat);
chatbotRoutes.get('/chat', strictRateLimiter, chatbotController.handleChat);
chatbotRoutes.get('/history', chatbotController.getChatHistory);
buyerRouter.use('/chatbot', chatbotRoutes);

// ... (các route còn lại giữ nguyên, không cần thay đổi)
// Review routes
const reviewRoutes = express.Router();
reviewRoutes.use(isBuyer);
reviewRoutes.post('/', strictRateLimiter, reviewController.createReview);
reviewRoutes.get('/', reviewController.getBuyerReviews);
reviewRoutes.put('/:id', strictRateLimiter, reviewController.updateReview);
reviewRoutes.delete('/:id', strictRateLimiter, reviewController.deleteReview);
buyerRouter.use('/reviews', reviewRoutes);

// Dispute routes
const disputeRoutes = express.Router();
disputeRoutes.use(isBuyer);
disputeRoutes.get('/eligibility/:orderItemId', disputeController.checkDisputeEligibility);
disputeRoutes.post('/', strictRateLimiter, disputeController.createDispute);
disputeRoutes.get('/', disputeController.getBuyerDisputes);
disputeRoutes.get('/:id', disputeController.getDisputeDetails);
disputeRoutes.put('/:id', strictRateLimiter, disputeController.updateDispute);
disputeRoutes.delete('/:id', strictRateLimiter, disputeController.cancelDispute);
buyerRouter.use('/disputes', disputeRoutes);

// Quản lý yêu cầu đổi/trả hàng
buyerRouter.post('/return-requests', strictRateLimiter, returnRequestController.createReturnRequest);
buyerRouter.get('/return-requests', returnRequestController.getUserReturnRequests);
buyerRouter.get('/return-requests/:id', returnRequestController.getReturnRequestDetail);
buyerRouter.delete('/return-requests/:id', strictRateLimiter, returnRequestController.cancelReturnRequest);

// Quản lý Profile cá nhân
buyerRouter.get("/profile", userController.getProfile);
buyerRouter.put("/profile", userController.updateProfile);


module.exports = buyerRouter;