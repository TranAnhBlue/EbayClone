const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const { authMiddleware, isSeller } = require("../middleware/auth.middleware");
const { authRateLimiter, generalRateLimiter, strictRateLimiter } = require("../middleware/rateLimit.middleware");

// Đăng nhập và chuyển chế độ (áp dụng rate limit nghiêm ngặt)
router.post("/login", authRateLimiter, sellerController.loginAndSwitch);

// Tạo cửa hàng (chỉ cần xác thực, không cần kiểm tra vai trò seller)
router.post("/store", generalRateLimiter, authMiddleware, sellerController.createStore);

// Tất cả các route khác yêu cầu xác thực và vai trò seller
router.use(generalRateLimiter);
router.use(authMiddleware); // Add this line to ensure authentication happens first
router.use(isSeller);

// Quản lý hồ sơ cửa hàng và người bán
router.get("/store", sellerController.getProfileStoreAndSeller);
router.put("/store", sellerController.updateStoreProfile);
router.put("/profile", sellerController.updateSellerProfile);

// Quản lý sản phẩm
router.post("/products", strictRateLimiter, sellerController.createProduct);
router.get("/products", sellerController.getProducts);
router.put("/products/:id", strictRateLimiter, sellerController.updateProduct);
router.delete("/products/:id", strictRateLimiter, sellerController.deleteProduct);
router.get('/categories', sellerController.getAllCategories);
router.post('/categories', strictRateLimiter, sellerController.addNewCategory);

// Quản lý tồn kho
router.put("/inventory/:productId", strictRateLimiter, sellerController.updateInventory);

// Lấy chi tiết 1 sản phẩm
router.get("/products/:id", sellerController.getProductById);

// Lấy review theo productId và Review
router.get("/products/:id/reviews", sellerController.getReviewsByProductId);

// Quản lý đơn hàng
router.get("/orders/history", sellerController.getOrderHistory);
router.put("/orders/item/:orderItemId/status", strictRateLimiter, sellerController.updateOrderItemStatus);
router.get("/orders/:orderId/payment", sellerController.getOrderPayment);
router.put("/payments/:paymentId/status", strictRateLimiter, sellerController.updatePaymentStatus);

// Shipping management
router.get("/shipping", sellerController.getShippingInfo);
router.put("/shipping/:shippingInfoId/status", strictRateLimiter, sellerController.updateShippingStatus);

// Khiếu nại
router.get("/disputes", sellerController.getDisputes);
router.put("/disputes/:id/resolve", strictRateLimiter, sellerController.resolveDispute);

//Trả hàng
router.get("/return-requests", sellerController.getReturnRequests);
router.put("/return-requests/:id", strictRateLimiter, sellerController.updateReturnRequest);

// Báo cáo
router.get("/report", sellerController.getSalesReport);

// Đánh giá và phản hồi
router.get("/reviews", sellerController.getProductReviews);
router.post("/feedback", strictRateLimiter, sellerController.submitFeedback);
router.post("/products/:productId/reviews/:reviewId/reply", strictRateLimiter, sellerController.replyToReview);

module.exports = router;