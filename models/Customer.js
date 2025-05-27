const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    //Basic details

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

    //Advanced details

    dateOfBirth: {
      type: Date,
    },
    dateOfAnniversary: {
      type: Date,
    },
    specialDays: {
      type: String,
      enum: ["BirthDay", "Anniversary"],
    },
    profession: {
      type: String,
    },
    incomeLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    location: {
      type: String,
    },
    favouriteProducts: {
      // type: [String], // changed as array to String for excel file import
      type: String,
    },
    favouriteColour: {
      type: String,
    },
    favouriteBrands: {
      // type: [String],
      type: String,
    },
    lifeStyle: {
      type: String,
    },
    interests: {
      // type: [String],
      type: String,
    },
    customerLabel: {
      type: String,
      enum: ["WhatsApp", "Email", "SMS", "Phone Call", "In-Person"],
    },

    //Advanced Privacy details

    communicationChannel: {
      type: String,
      enum: ["WhatsApp", "Email", "SMS", "Phone Call", "In-Person"],
    },
    typesOfCommunication: {
      type: String,
      enum: ["Discount Offers", "New Arrivals", "Fashion Trends"],
    },
    privacyNotes: {
      type: String,
      enum: [
        "I agree to share my data with Vadik.Ai",
        "I do not want to share my data with Vadik.Ai",
      ],
    },
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    engagementScore: {
      type: Number,
      min: 1,
      max: 100,
    },
    optOption: {
      type: String,
      enum: ["Opt-In", "Opt-Out"],
    },
    loyaltyPoints: {
      type: Number,
      default: 5000,
    },
    purchaseHistory: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    products: {
      // type: [String],
      type: String,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    amountSpent: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    // Response
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    clickRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    currentBusinessValue: {
      type: Number,
    },
    predictedFutureValue: {
      type: Number,
    },

    // Referral

    referralCode: { type: String },
    refJoinDate: { type: Date, default: Date.now },
    refStatus: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },

    //for Campaigns

    preferences: {
      favoriteProducts: [String],
      birthday: Date,
      interests: [String],
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
  },

  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
