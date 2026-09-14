/**
 * Smart Queue & Wait Time Estimator Algorithm (MongoDB / Mongoose)
 */
const Order = require('./models/Order');

async function calculateQueueDetails(clientOrOrderId, maybeOrderId) {
  // Support both (Order) document or orderId passed directly
  const orderId = typeof clientOrOrderId === 'string' || typeof clientOrOrderId === 'object' && clientOrOrderId._id ? clientOrOrderId : maybeOrderId;

  let order;
  if (typeof orderId === 'string') {
    order = await Order.findById(orderId);
  } else if (orderId && orderId.status) {
    order = orderId;
  }

  if (!order) {
    return { queuePosition: 0, estimatedWaitMins: 0, status: 'NOT_FOUND' };
  }

  if (order.status === 'READY') {
    return { queuePosition: 0, estimatedWaitMins: 0, status: 'READY', message: 'Ready for immediate pickup!' };
  }

  if (order.status === 'PICKED_UP' || order.status === 'CANCELLED') {
    return { queuePosition: 0, estimatedWaitMins: 0, status: order.status };
  }

  // Count active orders ahead for the same cafeteria
  const aheadOrders = await Order.find({
    cafeteria_id: order.cafeteria_id,
    status: { $in: ['PLACED', 'ACCEPTED', 'PREPARING'] },
    created_at: { $lt: order.created_at },
    _id: { $ne: order._id }
  }).sort({ created_at: 1 });

  const queuePosition = aheadOrders.length + 1;

  // Calculate workload sum ahead
  const totalAheadPrepTime = aheadOrders.reduce((sum, o) => sum + (o.estimated_prep_mins || 10), 0);
  
  // Kitchen parallel processing capacity factor (assumed 2 orders cooked concurrently)
  const concurrencyFactor = 2;
  
  const estimatedWaitMins = Math.max(
    3,
    Math.round((totalAheadPrepTime / concurrencyFactor) + (order.estimated_prep_mins || 8))
  );

  return {
    orderId: order._id.toString(),
    orderNumber: order.order_number,
    queuePosition,
    aheadCount: aheadOrders.length,
    estimatedWaitMins,
    status: order.status
  };
}

async function getCafeteriaRushStatus(clientOrCafeteriaId, maybeCafeteriaId) {
  const cafeteriaId = typeof clientOrCafeteriaId === 'string' || typeof clientOrCafeteriaId === 'object' && clientOrCafeteriaId._id ? clientOrCafeteriaId : maybeCafeteriaId;

  const activeCount = await Order.countDocuments({
    cafeteria_id: cafeteriaId,
    status: { $in: ['PLACED', 'ACCEPTED', 'PREPARING'] }
  });

  let rushLevel = 'LOW'; // LOW, MODERATE, HIGH
  let rushLabel = 'Low Rush';
  let rushBadgeColor = 'green';
  let estimatedWaitAvg = '5-10 min';

  if (activeCount >= 7) {
    rushLevel = 'HIGH';
    rushLabel = 'High Rush';
    rushBadgeColor = 'red';
    estimatedWaitAvg = '20-30 min';
  } else if (activeCount >= 3) {
    rushLevel = 'MODERATE';
    rushLabel = 'Moderate Rush';
    rushBadgeColor = 'yellow';
    estimatedWaitAvg = '10-20 min';
  }

  return {
    activeOrdersCount: activeCount,
    rushLevel,
    rushLabel,
    rushBadgeColor,
    estimatedWaitAvg
  };
}

module.exports = {
  calculateQueueDetails,
  getCafeteriaRushStatus
};
