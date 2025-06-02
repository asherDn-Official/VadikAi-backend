const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  customerType: { type: String },
  orderId: { type: String, required: true, unique: true },
  products: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number}
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);