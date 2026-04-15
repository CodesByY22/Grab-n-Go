const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }, // URL to image
  isAvailable: { type: Boolean, default: true },
});

const shopSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String
  },
  menu: [menuItemSchema],
  isOpen: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
