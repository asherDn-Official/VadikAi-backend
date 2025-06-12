const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  designation: { type: String, required: true }, // e.g., Manager, Sales, etc.
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    required: true,
  },
  permissions: {
    adminDashboard: { type: Boolean, default: false },
    customerProfile: { type: Boolean, default: false },
    customerOpportunity: { type: Boolean, default: false },
    personalizationInsights: { type: Boolean, default: false },
    performanceTracking: { type: Boolean, default: false },
    integrationManagement: { type: Boolean, default: false },
    kyc: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
  },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
