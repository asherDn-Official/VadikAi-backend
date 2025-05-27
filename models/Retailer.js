const mongoose = require("mongoose");

const retailerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
    },
    profileId: {
      type: Number,
      unique: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeType: {
      type: [String],
    },
    storeAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    gstNumber: {
      type: String,
    },
    numberOfStaffs: {
      type: Number,
      default: 0,
    },
    shopContactNumber: {
      type: Number,
    },
    ownerName: {
      type: String,
    },
    password: {
      type: String,
      required: false,
    },

    // Soft‐delete fields:
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },

    // mustChangePassword: {
    //   type: Boolean,
    //   default: true, // Required change on first login
    // },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Retailer", retailerSchema);
