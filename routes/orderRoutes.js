const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../middlewares/upload');

// Create a new order
router.post('/create-orders', orderController.createOrder);

// Get orders by date
router.get('/list/:date', orderController.getOrdersByDate);

// Get daily billing summary
router.get('/daily-billing', orderController.getDailyBillingSummary);

// Import orders from file
router.post(
  '/import',
  upload.single('file'), 
  orderController.importOrders
);

module.exports = router;