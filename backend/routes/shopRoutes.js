const express = require('express');
const router = express.Router();
const {
  createShop,
  getMyShop,
  getShops,
  getShopById,
  addMenuItem,
  removeMenuItem,
  toggleShopOpen,
  toggleMenuItemAvailability,
} = require('../controllers/shopController');
const { protect, vendor } = require('../middleware/authMiddleware');

// IMPORTANT: Static routes MUST come before parameterized routes
// Otherwise Express matches "myshop" and "menu" as :id values

router.route('/myshop').get(protect, vendor, getMyShop);
router.route('/menu').post(protect, vendor, addMenuItem);
router.route('/menu/:itemId').delete(protect, vendor, removeMenuItem);
router.route('/menu/:itemId/toggle').put(protect, vendor, toggleMenuItemAvailability);
router.route('/toggle').put(protect, vendor, toggleShopOpen);

router.route('/')
  .post(protect, vendor, createShop)
  .get(getShops);

router.route('/:id').get(getShopById);

module.exports = router;
