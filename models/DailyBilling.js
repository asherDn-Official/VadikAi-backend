const mongoose = require('mongoose');

const DailyBillingSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  numberOfCustomers: { type: Number, required: true },
  totalSales: { type: Number, required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

module.exports = mongoose.model('DailyBilling', DailyBillingSchema);