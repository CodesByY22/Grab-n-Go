const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, vendor } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems);

router.route('/myorders').get(protect, getMyOrders);
router.route('/shoporders').get(protect, vendor, getShopOrders);
router.route('/:id/status').put(protect, vendor, updateOrderStatus);

module.exports = router;
