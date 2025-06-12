const Customer = require("../models/Customer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path"); // for excel template download

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { phone, email, profileId } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ phone }, { email: email || null },{ profileId: profileId || null }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        message:
          "Customer already exists with given phone, email, or profileId",
        customer: existingCustomer,
      });
    }

     const customerData = {
      ...req.body,

      // dynamic fields

       advancedDetails: req.body.advancedDetails || {},
      privacyDetails: req.body.privacyDetails || {},
      referenceDetails: req.body.referenceDetails || {},

    };

    if (req.file) {
      customerData.photo = req.file.path;
    }

    // Create new customer
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  --- change for dynamic fields ---

// Get all customers with advanced filtering
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
      // Basic filters
      gender,
      source,
      status,
      active,
      // Map field filters
      ...otherFilters
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build the filter query
    const filterQuery = { isDeleted: false };

    // Search across multiple fields
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Basic field filters
    if (gender) filterQuery.gender = gender;
    if (source) filterQuery.source = source;
    if (status) filterQuery.status = status;
    if (active !== undefined) filterQuery.active = active === "true";

    // Handle map field filters
    const mapFields = ['advancedDetails', 'privacyDetails', 'referenceDetails'];
    for (const field of mapFields) {
      if (otherFilters[field]) {
        try {
          const fieldFilters = JSON.parse(otherFilters[field]);
          for (const [key, value] of Object.entries(fieldFilters)) {
            filterQuery[`${field}.${key}`] = value;
          }
        } catch (e) {
          console.warn(`Invalid filter for ${field}:`, otherFilters[field]);
        }
      }
    }

    // Handle preferences filters
    if (otherFilters.preferences) {
      try {
        const prefFilters = JSON.parse(otherFilters.preferences);
        for (const [key, value] of Object.entries(prefFilters)) {
          filterQuery[`preferences.${key}`] = value;
        }
      } catch (e) {
        console.warn('Invalid preferences filter:', otherFilters.preferences);
      }
    }

    // Date filtering (createdAt)
    if (otherFilters.fromDate && otherFilters.toDate) {
      filterQuery.createdAt = {
        $gte: new Date(otherFilters.fromDate),
        $lte: new Date(otherFilters.toDate),
      };
    }

    // Sorting
    const sortOptions = {};
    const allowedSortFields = ["name", "createdAt", "lastVisit", "firstVisit", "joinDate"];
    if (allowedSortFields.includes(sortField)) {
      sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["createdAt"] = -1;
    }

    // Fetch data
    const total = await Customer.countDocuments(filterQuery);
    const customers = await Customer.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(200).json({
      success: true,
      data: customers,
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

// Update a customer

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // If a new photo is uploaded, delete the old one
    if (req.file) {
      if (customer.photo) {
        const fs = require("fs");
        const path = require("path");
        const oldPath = path.join(__dirname, "..", customer.photo);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("Old photo delete error:", err.message);
        });
      }
      req.body.photo = req.file.path;
    }

    // dynamic fields

     if (req.body.advancedDetails) {
      customer.advancedDetails = { ...customer.advancedDetails, ...req.body.advancedDetails };
      delete req.body.advancedDetails;
    }
    if (req.body.privacyDetails) {
      customer.privacyDetails = { ...customer.privacyDetails, ...req.body.privacyDetails };
      delete req.body.privacyDetails;
    }
    if (req.body.referenceDetails) {
      customer.referenceDetails = { ...customer.referenceDetails, ...req.body.referenceDetails };
      delete req.body.referenceDetails;
    }

    Object.assign(customer, req.body);
    await customer.save();

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

// Update Basic Details

exports.updateBasicDetails = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      gender: req.body.gender,
      source: req.body.source,
      status: req.body.status,
      profileId: req.body.profileId,
    };

    if (req.file) {
      updateData.photo = req.file.path;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Advanced Details

exports.updateAdvancedDetails = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Merge new advanced details with existing ones
    customer.advancedDetails = { ...customer.advancedDetails, ...req.body };
    await customer.save();

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Privacy Details

exports.updatePrivacyDetails = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Merge new privacy details with existing ones
    customer.privacyDetails = { ...customer.privacyDetails, ...req.body };
    await customer.save();

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- change for dynamic fields ---

// Referral Details

exports.updateReferralDetails = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Merge new reference details with existing ones
    customer.referenceDetails = { ...customer.referenceDetails, ...req.body };
    await customer.save();

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- change for dynamic fields ---

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
      try {
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

        // Prepare customer data
        const customerData = {
          name,
          phone,
          email,
          profileId,
          gender: cleanString(row.gender),
          source: cleanString(row.source),
          status: cleanString(row.status) || "Active User",
          active: row.active !== undefined ? row.active : true,
          firstVisit: row.firstVisit ? new Date(row.firstVisit) : new Date(),
          lastVisit: row.lastVisit ? new Date(row.lastVisit) : new Date(),
          joinDate: row.joinDate ? new Date(row.joinDate) : new Date(),
        };

        // Handle map fields
        const mapFields = ['advancedDetails', 'privacyDetails', 'referenceDetails'];
        for (const field of mapFields) {
          if (row[field]) {
            try {
              customerData[field] = typeof row[field] === 'string' ? 
                JSON.parse(row[field]) : 
                row[field];
            } catch (e) {
              console.warn(`Invalid ${field} format in row:`, row);
            }
          }
        }

        // Handle preferences
        if (row.preferences) {
          try {
            customerData.preferences = typeof row.preferences === 'string' ?
              JSON.parse(row.preferences) :
              row.preferences;
          } catch (e) {
            console.warn('Invalid preferences format in row:', row);
          }
        }

        // Find existing customer
        const query = {
          $or: [
            profileId ? { profileId } : null,
            email ? { email } : null,
            phone ? { phone } : null,
          ].filter(Boolean),
        };

        const existing = await Customer.findOne(query);

        if (existing) {
          // Update existing customer
          await Customer.findByIdAndUpdate(existing._id, customerData);
          updated++;
        } else {
          // Create new customer
          await Customer.create(customerData);
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


// export sample import template

exports.downloadImportTemplate = (req, res) => {
  try {
    // Sample template row
    const data = [
      {
        name: "Santhosh",
        email: "santhosh@example.com",
        phone: "9876543210",
        profileId: "123",
        gender: "Male",
        source: "Online",
        status: "Active User",
        active: true,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        advancedDetails: JSON.stringify({ occupation: " Software Developer" }),
        privacyDetails: JSON.stringify({ shareEmail: false }),
        referenceDetails: JSON.stringify({ referredBy: "Santhosh" }),
       
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Ensure 'exports' directory exists
    const exportsDir = path.join(__dirname, "../exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filePath = path.join(exportsDir, "import_template.xlsx");

    // Save the Excel file
    XLSX.writeFile(workbook, filePath);

    // Send file as download
    res.download(filePath, "import_template.xlsx");
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({ error: error.message });
  }
};
