const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  campaignId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  phone: String,
  status: String,
  timestamp: Date
});

module.exports = mongoose.model('MessageLog', messageLogSchema);
