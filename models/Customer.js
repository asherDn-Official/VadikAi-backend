const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Basic details
    name: {
      type: String,
      required: true,
    },
    profileId: {
      type: Number,
      unique: true,
    },
    photo: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    source: {
      type: String,
      enum: ["Walk-In", "Online", "Website", "Social Media"],
    },
    status: {
      type: String,
      enum: ["Active User", "Inactive User"],
      default: "Active User",
    },
    active: {
      type: Boolean,
      default: true,
    },
    firstVisit: {
      type: Date,
      default: Date.now,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },

    // Advanced details

    advancedDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Advanced Privacy details

    privacyDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Reference details

    referenceDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // For Campaigns

    preferences: {
      favoriteProducts: [String],
      birthday: Date,
      interests: [String],
    },

    // For Chatbot

    preference: [String],

    orderCount: Number,
    totalSpend: Number,

    // Soft‐delete fields:
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
