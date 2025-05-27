const Customer = require("../models/Customer");
const XLSX = require("xlsx");
const fs = require("fs");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { phone, email, profileId } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ phone }, { profileId: profileId || null }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        message:
          "Customer already exists with given phone, email, or profileId",
        customer: existingCustomer,
      });
    }

    // Create new customer
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all customers with optional query filters
// exports.getAllCustomers = async (req, res) => {
//   try {
//     const filters = req.query || {};
//     const customers = await Customer.find(filters);
//     res.status(200).json(customers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get all customers with optional query filters
// This function allows for pagination, sorting, and searching

// exports.getAllCustomers = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       sortField = "createdAt",
//       sortOrder = "desc",
//     } = req.query;

//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//     const skip = (pageNumber - 1) * pageSize;

//     const searchQuery = {
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { phone: { $regex: search, $options: "i" } },
//       ],
//     };

//     const sortOptions = {};
//     const allowedSortFields = ["name", "createdAt"];
//     if (allowedSortFields.includes(sortField)) {
//       sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
//     } else {
//       sortOptions["createdAt"] = -1;
//     }

//     const total = await Customer.countDocuments(searchQuery);
//     const users = await Customer.find(searchQuery)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(pageSize)
//       .select("-password")
//       .lean();

//     res.status(200).json({
//       success: true,
//       data: users,
//       pagination: {
//         total,
//         page: pageNumber,
//         limit: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllCustomers:", error.message);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch customers" });
//   }
// };

// Added extra feature for Personlized Sectionn

// GET /api/customers/getAll
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",

      // Filters
      gender,
      source,
      profession,
      incomeLevel,
      location,
      favouriteProducts,
      favouriteColour,
      favouriteBrands,
      specialDays,
      lifeStyle,
      interests,
      customerLabel,
      active,
      churnRate,
      rating,
      loyaltyPoints,
      currentBusinessValue,
      predictedFutureValue,
      engagementScore,

      // Date range for Yearly / Quarterly / Monthly views
      fromDate,
      toDate,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build the filter query
    const filterQuery = {};

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (gender) filterQuery.gender = gender;
    if (source) filterQuery.source = source;
    if (profession) filterQuery.profession = profession;
    if (incomeLevel) filterQuery.incomeLevel = incomeLevel;
    if (location) filterQuery.location = location;
    if (favouriteProducts) filterQuery.favouriteProducts = favouriteProducts;
    if (favouriteColour) filterQuery.favouriteColour = favouriteColour;
    if (favouriteBrands) filterQuery.favouriteBrands = favouriteBrands;
    if (specialDays) filterQuery.specialDays = specialDays;
    if (lifeStyle) filterQuery.lifeStyle = lifeStyle;
    if (interests) filterQuery.interests = interests;
    if (customerLabel) filterQuery.customerLabel = customerLabel;
    if (active !== undefined) filterQuery.active = active === "true";
    // if (churnRate) filterQuery.churnRate = churnRate;
    if (rating) filterQuery.rating = rating;
    if (loyaltyPoints) filterQuery.loyaltyPoints = parseInt(loyaltyPoints);
    if (currentBusinessValue) filterQuery.currentBusinessValue = parseFloat(currentBusinessValue);
    if (predictedFutureValue) filterQuery.predictedFutureValue = parseFloat(predictedFutureValue);
    if (engagementScore) filterQuery.engagementScore = parseFloat(engagementScore);

    // Date filtering (createdAt)
    if (fromDate && toDate) {
      filterQuery.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // Sorting
    const sortOptions = {};
    const allowedSortFields = ["name", "createdAt"];
    if (allowedSortFields.includes(sortField)) {
      sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["createdAt"] = -1;
    }

    // Fetch data
    const total = await Customer.countDocuments(filterQuery);
    const users = await Customer.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .select("-password")
      .lean();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getAllCustomers:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};


// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// General update for any field
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a customer using Soft delete method  -- use middleware for our better
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer soft-deleted successfully", customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Basic Details

exports.updateBasicDetails = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          gender: req.body.gender,
          source: req.body.source,
          firstVisit: req.body.firstVisit,
          lastVisit: req.body.lastVisit,
          status: req.body.status,
          profileId: req.body.profileId,
          joinDate: req.body.joinDate,
        },
      },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Advanced Details

exports.updateAdvancedDetails = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dateOfBirth: req.body.dateOfBirth,
          dateOfAnniversary: req.body.dateOfAnniversary,
          profession: req.body.profession,
          incomeLevel: req.body.incomeLevel,
          location: req.body.location,
          favouriteProducts: req.body.favouriteProducts,
          favouriteColours: req.body.favouriteColours,
          favouriteBrands: req.body.favouriteBrands,
          lifeStyle: req.body.lifeStyle,
          interests: req.body.interests,
          customerLabel: req.body.customerLabel,
        },
      },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Privacy Details

exports.updatePrivacyDetails = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          communicationChannel: req.body.communicationChannel,
          typesOfCommunication: req.body.typesOfCommunication,
          privacyNotes: req.body.privacyNotes,
          satisfactionScore: req.body.satisfactionScore,
          engagementScore: req.body.engagementScore,
          optOption: req.body.optOption,
        },
      },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Referral Details

exports.updateReferralDetails = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          referredBy: req.body.referredBy,
          referralCode: req.body.referralCode,
          rewardsEarned: req.body.rewardsEarned,
        },
      },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Import from Excel

exports.importFromExcel = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    const seenProfiles = new Set();

    const cleanString = (str) => str?.toString().trim() || undefined;

    for (const row of data) {
      // Normalize and clean data
      const email = cleanString(row.email)?.toLowerCase();
      const phone = cleanString(row.phone);
      const profileId = cleanString(row.profileId);
      const name = cleanString(row.name);

      const uniqueKey = email || phone || profileId;

      // Check for duplicate in same file
      if (seenProfiles.has(uniqueKey)) {
        skipped++;
        errors.push({ row, reason: "Duplicate entry in uploaded file" });
        continue;
      }
      seenProfiles.add(uniqueKey);

      // Basic validations
      if (!profileId && !email && !phone) {
        skipped++;
        errors.push({
          row,
          reason: "Missing identifiers (email, phone, profileId)",
        });
        continue;
      }

      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        skipped++;
        errors.push({ row, reason: "Invalid email format" });
        continue;
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        skipped++;
        errors.push({
          row,
          reason: "Invalid phone format (must be 10 digits)",
        });
        continue;
      }

      if (!name) {
        skipped++;
        errors.push({ row, reason: "Name is required" });
        continue;
      }

      const query = {
        $or: [
          profileId ? { profileId } : null,
          email ? { email } : null,
          phone ? { phone } : null,
        ].filter(Boolean),
      };

      const update = {
        ...(profileId && { profileId }),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(row.gender && { gender: cleanString(row.gender) }),
        ...(row.source && { source: cleanString(row.source) }),
        ...(row.status && { status: cleanString(row.status) }),
        ...(row.firstVisit && { firstVisit: row.firstVisit }),
        ...(row.lastVisit && { lastVisit: row.lastVisit }),
        ...(row.dateOfBirth && { dateOfBirth: row.dateOfBirth }),
        ...(row.dateOfAnniversary && {
          dateOfAnniversary: row.dateOfAnniversary,
        }),
        ...(row.profession && { profession: cleanString(row.profession) }),
        ...(row.incomeLevel && { incomeLevel: cleanString(row.incomeLevel) }),
        ...(row.location && { location: cleanString(row.location) }),
        ...(row.favouriteProducts && {
          favouriteProducts: row.favouriteProducts,
        }),
        ...(row.favouriteColour && {
          favouriteColour: cleanString(row.favouriteColour),
        }),
        ...(row.favouriteBrands && { favouriteBrands: row.favouriteBrands }),
        ...(row.lifeStyle && { lifeStyle: cleanString(row.lifeStyle) }),
        ...(row.interests && { interests: row.interests }),
        ...(row.customerLabel && {
          customerLabel: cleanString(row.customerLabel),
        }),
        ...(row.communicationChannel && {
          communicationChannel: row.communicationChannel,
        }),
        ...(row.typesOfCommunication && {
          typesOfCommunication: row.typesOfCommunication,
        }),
        ...(row.privacyNotes && {
          privacyNotes: cleanString(row.privacyNotes),
        }),
        ...(row.satisfactionScore && {
          satisfactionScore: row.satisfactionScore,
        }),
        ...(row.engagementScore && { engagementScore: row.engagementScore }),
        ...(row.optOption && { optOption: row.optOption }),
        ...(row.loyaltyPoints && { loyaltyPoints: row.loyaltyPoints }),
        ...(row.purchaseHistory && { purchaseHistory: row.purchaseHistory }),
        ...(row.products && { products: row.products }),
        ...(row.purchaseDate && { purchaseDate: row.purchaseDate }),
        ...(row.amountSpent && { amountSpent: row.amountSpent }),
        ...(row.quantity && { quantity: row.quantity }),
        ...(row.referralCode && {
          referralCode: cleanString(row.referralCode),
        }),
        ...(row.joinDate && { joinDate: row.joinDate }),
        ...(row.refStatus && { refStatus: cleanString(row.refStatus) }),
      };

      try {
        const existing = await Customer.findOne(query);

        if (existing) {
          await Customer.updateOne({ _id: existing._id }, update);
          updated++;
        } else {
          await Customer.create(update);
          inserted++;
        }
      } catch (dbErr) {
        skipped++;
        errors.push({ row, reason: `Database error: ${dbErr.message}` });
        continue;
      }
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Import completed",
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
