const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, User, Cafeteria, Category, MenuItem, Order, Notification } = require('./db');
const { seedMongo } = require('./seed_mongo');
const { generateToken, authenticateToken, requireAuth, requireRole } = require('./authMiddleware');
const { calculateQueueDetails, getCafeteriaRushStatus } = require('./queueCalculator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());
app.use(authenticateToken);

// Connect to MongoDB Database & Auto-Seed
connectDB().then(async () => {
  await seedMongo();
});

// Socket.io real-time connection handler
io.on('connection', (socket) => {
  console.log('⚡ Socket client connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

// Helper to check valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch cafeteria details if vendor
    let cafeteria = null;
    if (user.role === 'VENDOR') {
      cafeteria = await Cafeteria.findOne({ vendor_user_id: user._id });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        cafeteria
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'STUDENT', phone } = req.body;
  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password_hash: hashedPw,
      role,
      phone
    });

    const token = generateToken(user);
    res.status(201).json({ 
      token, 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url
      } 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.user.id)) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let cafeteria = null;
    if (user.role === 'VENDOR') {
      cafeteria = await Cafeteria.findOne({ vendor_user_id: user._id });
    }

    res.json({ 
      user: { 
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        avatarUrl: user.avatar_url,
        cafeteria 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ----------------------------------------------------
// 2. CAFETERIA & CATEGORY ROUTES
// ----------------------------------------------------

app.get('/api/cafeterias', async (req, res) => {
  try {
    const cafes = await Cafeteria.find({}).populate('vendor_user_id', 'name');

    const cafeteriasWithRush = await Promise.all(cafes.map(async (c) => {
      const rush = await getCafeteriaRushStatus(c._id);
      const json = c.toJSON();
      if (c.vendor_user_id) json.vendor_name = c.vendor_user_id.name;
      return { ...json, rush };
    }));

    res.json(cafeteriasWithRush);
  } catch (err) {
    console.error('Error fetching cafeterias:', err);
    res.status(500).json({ error: 'Failed to fetch cafeterias' });
  }
});

app.get('/api/cafeterias/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Cafeteria not found' });

    const cafe = await Cafeteria.findById(req.params.id);
    if (!cafe) return res.status(404).json({ error: 'Cafeteria not found' });

    const rush = await getCafeteriaRushStatus(cafe._id);
    res.json({ ...cafe.toJSON(), rush });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafeteria' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ sort_order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ----------------------------------------------------
// 3. MENU ROUTES
// ----------------------------------------------------

app.get('/api/cafeterias/:id/menu', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.json([]);

    const menuItems = await MenuItem.find({ cafeteria_id: req.params.id }).populate('category_id', 'name icon');

    const itemsFormatted = menuItems.map(item => {
      const json = item.toJSON();
      if (item.category_id) {
        json.category_name = item.category_id.name;
        json.category_icon = item.category_id.icon;
        json.category_id = item.category_id._id.toString();
      }
      return json;
    });

    res.json(itemsFormatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  const { cafeteria_id, category_id, name, description, price, prep_time_mins, is_veg, is_available = true, image_url, tags = [] } = req.body;
  try {
    const newItem = await MenuItem.create({
      cafeteria_id,
      category_id,
      name,
      description,
      price,
      prep_time_mins: prep_time_mins || 10,
      is_veg,
      is_available,
      image_url,
      tags
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu/:id', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  const { name, description, price, prep_time_mins, is_veg, is_available, image_url, category_id, tags } = req.body;
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Item not found' });
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, prep_time_mins, is_veg, is_available, image_url, category_id, tags },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.patch('/api/menu/:id/availability', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  const { is_available } = req.body;
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Item not found' });
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { is_available },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item availability' });
  }
});

// ----------------------------------------------------
// 4. ORDER & SMART QUEUE ROUTES
// ----------------------------------------------------

app.post('/api/orders', requireAuth, async (req, res) => {
  const { cafeteriaId, items, orderType = 'ASAP', scheduledTime } = req.body;
  const studentId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  if (!isValidId(studentId)) {
    return res.status(401).json({ error: 'Invalid user session' });
  }

  try {
    let totalAmount = 0;
    let maxPrepTime = 5;
    const formattedItems = [];

    for (const item of items) {
      if (isValidId(item.id)) {
        const dbItem = await MenuItem.findById(item.id);
        if (dbItem) {
          totalAmount += parseFloat(dbItem.price) * item.quantity;
          if (dbItem.prep_time_mins > maxPrepTime) maxPrepTime = dbItem.prep_time_mins;
          formattedItems.push({
            menu_item_id: dbItem._id,
            item_name: dbItem.name,
            quantity: item.quantity,
            unit_price: dbItem.price,
            notes: item.notes || ''
          });
          continue;
        }
      }

      formattedItems.push({
        item_name: item.name || 'Food Item',
        quantity: item.quantity,
        unit_price: item.price || 100,
        notes: item.notes || ''
      });
      totalAmount += (item.price || 100) * item.quantity;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GN-${randomSuffix}`;
    const pickupCode = `GN-${Math.floor(1000 + Math.random() * 9000)}`;

    const validCafeId = isValidId(cafeteriaId) ? cafeteriaId : (await Cafeteria.findOne({}))?._id;

    const newOrder = await Order.create({
      order_number: orderNumber,
      user_id: studentId,
      cafeteria_id: validCafeId,
      status: 'PLACED',
      items: formattedItems,
      total_amount: totalAmount,
      estimated_prep_mins: maxPrepTime,
      pickup_qr_code: pickupCode,
      pickup_type: orderType,
      scheduled_time: scheduledTime || null
    });

    // Create Notification
    await Notification.create({
      user_id: studentId,
      title: 'Order Placed Successfully 🎉',
      message: `Your order ${orderNumber} has been received by the kitchen.`,
      type: 'ORDER_PLACED'
    });

    const queueInfo = await calculateQueueDetails(newOrder);

    // Socket Emissions
    io.to(studentId).emit('order_created', { orderId: newOrder._id.toString(), orderNumber });
    io.to(`cafeteria_${validCafeId}`).emit('new_vendor_order', { orderId: newOrder._id.toString(), orderNumber });

    const responseOrder = newOrder.toJSON();
    responseOrder.student_id = studentId;
    responseOrder.pickup_code = pickupCode;

    res.status(201).json({
      order: responseOrder,
      queueInfo,
      message: 'Order placed successfully'
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders/my', requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.user.id)) return res.json([]);

    const orders = await Order.find({ user_id: req.user.id })
      .populate('cafeteria_id', 'name location image_url')
      .sort({ created_at: -1 });

    const ordersWithQueue = await Promise.all(orders.map(async (order) => {
      const queueInfo = await calculateQueueDetails(order);
      const json = order.toJSON();
      json.student_id = req.user.id;
      json.pickup_code = order.pickup_qr_code;
      if (order.cafeteria_id) {
        json.cafeteria_name = order.cafeteria_id.name;
        json.cafeteria_location = order.cafeteria_id.location;
        json.cafeteria_image = order.cafeteria_id.image_url;
        json.cafeteria_id = order.cafeteria_id._id.toString();
      }
      return {
        ...json,
        queueInfo
      };
    }));

    res.json(ordersWithQueue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student orders' });
  }
});

app.get('/api/orders/vendor', requireAuth, async (req, res) => {
  try {
    let cafeteriaId = req.query.cafeteriaId;
    if ((!cafeteriaId || !isValidId(cafeteriaId)) && req.user.role === 'VENDOR' && isValidId(req.user.id)) {
      const cafe = await Cafeteria.findOne({ vendor_user_id: req.user.id });
      if (cafe) cafeteriaId = cafe._id;
    }

    if (!cafeteriaId || !isValidId(cafeteriaId)) {
      const cafe = await Cafeteria.findOne({});
      if (cafe) cafeteriaId = cafe._id;
    }

    if (!cafeteriaId) return res.json([]);

    const orders = await Order.find({ cafeteria_id: cafeteriaId })
      .populate('user_id', 'name phone')
      .sort({ created_at: -1 });

    const formattedOrders = orders.map(order => {
      const json = order.toJSON();
      json.pickup_code = order.pickup_qr_code;
      if (order.user_id) {
        json.student_name = order.user_id.name;
        json.student_phone = order.user_id.phone;
        json.student_id = order.user_id._id.toString();
      }
      return json;
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor orders' });
  }
});

app.get('/api/orders/admin', requireRole('ADMIN'), async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user_id', 'name')
      .populate('cafeteria_id', 'name')
      .sort({ created_at: -1 });

    const formatted = orders.map(order => {
      const json = order.toJSON();
      json.pickup_code = order.pickup_qr_code;
      if (order.user_id) json.student_name = order.user_id.name;
      if (order.cafeteria_id) json.cafeteria_name = order.cafeteria_id.name;
      return json;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Order not found' });

    const order = await Order.findById(req.params.id).populate('cafeteria_id', 'name location');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const queueInfo = await calculateQueueDetails(order);
    const json = order.toJSON();
    json.pickup_code = order.pickup_qr_code;
    if (order.cafeteria_id) {
      json.cafeteria_name = order.cafeteria_id.name;
      json.cafeteria_location = order.cafeteria_id.location;
    }

    res.json({ ...json, queueInfo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

app.patch('/api/orders/:id/status', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!isValidId(orderId)) return res.status(404).json({ error: 'Order not found' });

  const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    let notifTitle = 'Order Update';
    let notifMsg = `Your order ${order.order_number} status updated to ${status}.`;

    if (status === 'ACCEPTED') {
      notifTitle = 'Order Accepted 👩‍🍳';
      notifMsg = `The cafeteria accepted your order #${order.order_number}.`;
    } else if (status === 'PREPARING') {
      notifTitle = 'Cooking Started 🍳';
      notifMsg = `Your order #${order.order_number} is now being prepared.`;
    } else if (status === 'READY') {
      notifTitle = 'READY FOR PICKUP! 🎉';
      notifMsg = `Your order #${order.order_number} is ready! Show code ${order.pickup_qr_code} to collect.`;
    } else if (status === 'PICKED_UP') {
      notifTitle = 'Food Picked Up! 😋';
      notifMsg = `Thank you! Order #${order.order_number} has been collected. Enjoy your meal!`;
    } else if (status === 'CANCELLED') {
      notifTitle = 'Order Cancelled ❌';
      notifMsg = `Order #${order.order_number} was cancelled.`;
    }

    await Notification.create({
      user_id: order.user_id,
      title: notifTitle,
      message: notifMsg,
      type: `ORDER_${status}`
    });

    const studentIdStr = order.user_id.toString();
    io.to(studentIdStr).emit('order_status', {
      orderId: order._id.toString(),
      orderNumber: order.order_number,
      status,
      pickupCode: order.pickup_qr_code,
      message: notifMsg
    });

    if (status === 'READY') {
      io.to(studentIdStr).emit('order_ready', {
        orderId: order._id.toString(),
        orderNumber: order.order_number,
        pickupCode: order.pickup_qr_code
      });
    }

    const responseJson = order.toJSON();
    responseJson.pickup_code = order.pickup_qr_code;

    res.json({ message: `Order status updated to ${status}`, order: responseJson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// QR Pickup Verification endpoint
app.post('/api/orders/verify-pickup', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  const { pickupCode } = req.body;
  if (!pickupCode) return res.status(400).json({ error: 'Pickup code is required' });

  try {
    const searchCode = pickupCode.trim().toUpperCase();
    const order = await Order.findOne({ pickup_qr_code: searchCode });

    if (!order) {
      return res.status(404).json({ error: 'Invalid pickup code. Order not found.' });
    }

    if (order.status === 'PICKED_UP') {
      return res.status(400).json({ error: 'Order has already been picked up!' });
    }

    order.status = 'PICKED_UP';
    await order.save();

    await Notification.create({
      user_id: order.user_id,
      title: 'Pickup Verified! 🍱',
      message: `Pickup code ${searchCode} verified. Enjoy your food!`,
      type: 'ORDER_PICKED_UP'
    });

    const studentIdStr = order.user_id.toString();
    io.to(studentIdStr).emit('order_status', {
      orderId: order._id.toString(),
      status: 'PICKED_UP',
      message: 'Verified pickup successfully'
    });

    const responseJson = order.toJSON();
    responseJson.pickup_code = order.pickup_qr_code;

    res.json({
      success: true,
      message: `Pickup confirmed for Order #${order.order_number}`,
      order: responseJson
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/orders/:id/cancel', requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.user.id)) return res.status(404).json({ error: 'Order not found' });

    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (['PREPARING', 'READY', 'PICKED_UP'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order once food preparation has started.' });
    }

    order.status = 'CANCELLED';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// ----------------------------------------------------
// 5. ANALYTICS ROUTES
// ----------------------------------------------------

app.get('/api/analytics/vendor', requireRole('VENDOR', 'ADMIN'), async (req, res) => {
  try {
    let cafeteriaId = req.query.cafeteriaId;
    if ((!cafeteriaId || !isValidId(cafeteriaId)) && req.user.role === 'VENDOR' && isValidId(req.user.id)) {
      const cafe = await Cafeteria.findOne({ vendor_user_id: req.user.id });
      if (cafe) cafeteriaId = cafe._id;
    }

    if (!cafeteriaId || !isValidId(cafeteriaId)) {
      const firstCafe = await Cafeteria.findOne({});
      if (firstCafe) cafeteriaId = firstCafe._id;
    }

    if (!cafeteriaId) return res.json({ stats: {}, topItems: [] });

    const orders = await Order.find({ cafeteria_id: cafeteriaId });
    
    let total_orders = orders.length;
    let pending_orders = 0;
    let preparing_orders = 0;
    let ready_orders = 0;
    let completed_orders = 0;
    let total_revenue = 0;

    const itemStatsMap = {};

    orders.forEach(o => {
      if (o.status === 'PLACED') pending_orders++;
      if (o.status === 'PREPARING') preparing_orders++;
      if (o.status === 'READY') ready_orders++;
      if (o.status === 'PICKED_UP') {
        completed_orders++;
        total_revenue += o.total_amount || 0;
      }

      (o.items || []).forEach(item => {
        if (!itemStatsMap[item.item_name]) {
          itemStatsMap[item.item_name] = { total_qty: 0, total_sales: 0 };
        }
        itemStatsMap[item.item_name].total_qty += item.quantity || 1;
        itemStatsMap[item.item_name].total_sales += (item.unit_price || 0) * (item.quantity || 1);
      });
    });

    const topItems = Object.keys(itemStatsMap).map(name => ({
      item_name: name,
      total_qty: itemStatsMap[name].total_qty,
      total_sales: itemStatsMap[name].total_sales
    })).sort((a, b) => b.total_qty - a.total_qty).slice(0, 5);

    res.json({
      stats: {
        total_orders,
        pending_orders,
        preparing_orders,
        ready_orders,
        completed_orders,
        total_revenue
      },
      topItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor analytics' });
  }
});

app.get('/api/analytics/admin', requireRole('ADMIN'), async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'STUDENT' });
    const cafeCount = await Cafeteria.countDocuments({ is_active: true });
    const orders = await Order.find({});

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let completedOrders = 0;

    orders.forEach(o => {
      totalRevenue += o.total_amount || 0;
      if (o.status === 'PICKED_UP') completedOrders++;
    });

    const cafeterias = await Cafeteria.find({});
    const cafePerformance = await Promise.all(cafeterias.map(async c => {
      const cafeOrders = await Order.find({ cafeteria_id: c._id });
      const rev = cafeOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      return {
        name: c.name,
        order_count: cafeOrders.length,
        revenue: rev
      };
    }));

    res.json({
      totalStudents: studentCount,
      activeCafeterias: cafeCount,
      totalOrders,
      totalRevenue,
      completedOrders,
      cafeteriaPerformance: cafePerformance.sort((a, b) => b.revenue - a.revenue)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// ----------------------------------------------------
// 6. NOTIFICATIONS ROUTES
// ----------------------------------------------------

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.user.id)) return res.json([]);

    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.json({ success: false });

    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Grab-N-Go MongoDB Server running on port ${PORT}`);
});
