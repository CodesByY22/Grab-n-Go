const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  cafeteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Utensils' },
  sort_order: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.cafeteria_id) ret.cafeteria_id = ret.cafeteria_id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
