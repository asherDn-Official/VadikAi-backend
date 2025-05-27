const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: String,
  messageTemplate: String,
  variables: [String],
  filters: {
    favoriteProducts: [String],
    interests: [String],
    birthday: Boolean,
  },
  schedule: {
    type: { type: String, enum: ['once', 'recurring'] },
    date: Date,
    recurringType: { type: String, enum: ['birthday'], required: function() { return this.type === 'recurring'; } },
  },
  status: { type: String, default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
