const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  cafeteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  prep_time_mins: { type: Number, default: 10 },
  is_veg: { type: Boolean, default: true },
  is_available: { type: Boolean, default: true },
  image_url: { type: String, default: '' },
  tags: [{ type: String }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

menuItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.cafeteria_id) ret.cafeteria_id = ret.cafeteria_id.toString();
    if (ret.category_id) ret.category_id = ret.category_id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
