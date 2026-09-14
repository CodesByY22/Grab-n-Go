const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unit_price: { type: Number, required: true },
  notes: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cafeteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
  status: {
    type: String,
    enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED'],
    default: 'PLACED'
  },
  items: [orderItemSchema],
  total_amount: { type: Number, required: true },
  estimated_prep_mins: { type: Number, default: 15 },
  queue_position: { type: Number, default: 1 },
  pickup_qr_code: { type: String, required: true },
  pickup_type: { type: String, enum: ['ASAP', 'SCHEDULED'], default: 'ASAP' },
  scheduled_time: { type: String, default: null },
  pickup_time: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.user_id) ret.user_id = ret.user_id.toString();
    if (ret.cafeteria_id) ret.cafeteria_id = ret.cafeteria_id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);
