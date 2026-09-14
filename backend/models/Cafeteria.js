const mongoose = require('mongoose');

const cafeteriaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  location: { type: String, required: true },
  vendor_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  is_active: { type: Boolean, default: true },
  opening_hours: { type: String, default: '08:00 AM - 09:00 PM' },
  avg_prep_time_mins: { type: Number, default: 12 },
  image_url: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

cafeteriaSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.vendor_user_id) ret.vendor_user_id = ret.vendor_user_id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Cafeteria', cafeteriaSchema);
