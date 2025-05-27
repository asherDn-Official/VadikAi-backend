const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  colors: [String],
  price: { type: Number, required: true },
  status: { type: String, enum: ['In Stock', 'Out of Stock', 'Limited Stock'], default: 'In Stock' },
  category: { type: String, required: true },
  images: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
