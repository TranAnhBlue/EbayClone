const express = require("express");
const adminRouter = require("./admin");
const sellerRouter = require("./seller");
const router = express.Router();
const authController = require("../controllers/authController");
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const categoryController = require('../controllers/categoryController');
const buyerRouter = require("./buyerRouter");
const chatRouter = require("./chatRouter");
const userController = require("../controllers/userController");
const imageRoutes = require("../routes/imageRoutes");
const { authMiddleware } = require("../middleware/auth.middleware");
const { authRateLimiter, generalRateLimiter, publicRateLimiter } = require("../middleware/rateLimit.middleware");
const ghnRoutes = require('../routes/ghnRoutes');
const shippingRoutes = require('../routes/shippingRoutes');

router.use("/admin", adminRouter);
router.use("/seller", sellerRouter);
router.use('/ghn', ghnRoutes);
router.use('/shipping', shippingRoutes);

// Health check endpoint for Docker/load balancer (không áp dụng rate limit)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ebayclone-backend'
  });
});

// Routes cho đăng ký và đăng nhập (áp dụng rate limit nghiêm ngặt)
router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/forgot-password", authRateLimiter, authController.forgotPassword);

// User profile routes (áp dụng rate limit chung)
router.get("/profile", generalRateLimiter, authMiddleware, authController.getProfile);
router.put("/profile", generalRateLimiter, authMiddleware, authController.updateProfile);
router.put("/profile/password", generalRateLimiter, authMiddleware, authController.updatePassword);

// User search routes (áp dụng rate limit chung)
router.get("/users/search", generalRateLimiter, authMiddleware, userController.searchUsers);
router.get("/users/:id", generalRateLimiter, authMiddleware, userController.getUserById);

router.use("/buyers", buyerRouter);
router.use("/chat", chatRouter);
router.use("/images", generalRateLimiter, authMiddleware, imageRoutes);

// Public routes (áp dụng rate limit công khai - nhiều hơn)
router.get('/products', publicRateLimiter, productController.listAllProducts);
router.get('/categories', publicRateLimiter, categoryController.listAllCategories);
// Public route for product reviews
router.get('/products/:productId/reviews', publicRateLimiter, reviewController.getProductReviews);

// Protected route for product details with all related information
router.get('/products/:productId/detail', generalRateLimiter, authMiddleware, productController.getProductDetail);

module.exports = router;