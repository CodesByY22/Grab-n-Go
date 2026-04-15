const Order = require('../models/Order');
const Shop = require('../models/Shop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shopId, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shop: shopId,
      totalPrice,
      status: 'Placed',
    });

    const createdOrder = await order.save();

    // Populate user info for the vendor notification
    const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');

    // Notify Vendor via shop room
    const io = req.app.get('io');
    io.to(shopId).emit('newOrder', populatedOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('shop', 'name image');
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Get orders for a shop (Vendor)
// @route   GET /api/orders/shoporders
// @access  Private/Vendor
const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const orders = await Order.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('Get shop orders error:', error);
    res.status(500).json({ message: 'Server error fetching shop orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Vendor
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Placed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();

      // Notify User about their order status change
      const io = req.app.get('io');
      io.to(order.user.toString()).emit('orderStatusUpdate', updatedOrder);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
};
