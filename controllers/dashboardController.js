const Customer = require("../models/Customer");

// Customer Profile Collection: Retention and New customers
exports.getCustomerProfileCollection = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // New customers = joined within period
    const newCustomers = await Customer.find({
      joinDate: { $gte: start, $lte: end },
    });

    // Retention customers = customers who visited before start AND visited during period
    // We'll consider customers with firstVisit < start AND lastVisit between start and end
    const retentionCustomers = await Customer.find({
      firstVisit: { $lt: start },
      lastVisit: { $gte: start, $lte: end },
    });

    res.json({
      newCustomersCount: newCustomers.length,
      retentionCustomersCount: retentionCustomers.length,
      newCustomers,
      retentionCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer Profile Overview: Total and Active customers
exports.getCustomerProfileOverview = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({});
    const activeCustomers = await Customer.find({ status: "Active User" });

    res.json({
      totalCustomers,
      activeCustomersCount: activeCustomers.length,
      activeCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerRetentionRate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Define next cycle (e.g., 1 month later)
    const nextCycleStart = new Date(end);
    const nextCycleEnd = new Date(end);
    nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1);

    // Customers acquired during current cycle
    const cohortCustomers = await Customer.find({
      firstVisit: { $gte: start, $lte: end },
    });

    // Customers from cohort who returned in the next cycle
    const retainedCustomers = await Customer.find({
      _id: { $in: cohortCustomers.map((c) => c._id) },
      lastVisit: { $gte: nextCycleStart, $lte: nextCycleEnd },
    });

    const rate =
      cohortCustomers.length === 0
        ? 0
        : (retainedCustomers.length / cohortCustomers.length) * 100;

    res.json({ retentionRate: rate.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Calculate Churn Rate %
// Churn = customers active before period but not active during period
exports.getChurnRate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Customers active before period
    const customersBeforePeriod = await Customer.find({
      lastVisit: { $lt: start },
      status: "Active User",
    });

    // Customers retained in period (visited in period)
    const retainedCustomers = await Customer.find({
      lastVisit: { $gte: start, $lte: end },
      status: "Active User",
    });

    // Churned = beforePeriod - retained in period
    const churnedCount =
      customersBeforePeriod.length - retainedCustomers.length < 0
        ? 0
        : customersBeforePeriod.length - retainedCustomers.length;

    const churnRate =
      customersBeforePeriod.length === 0
        ? 0
        : (churnedCount / customersBeforePeriod.length) * 100;

    res.json({ churnRate: churnRate.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Average Customer Engagement Score

exports.getCustomerEngagementScore = async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $project: {
          engagementScore: {
            $avg: ["$responseRate", "$clickRate"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgEngagement: { $avg: "$engagementScore" },
        },
      },
    ]);

    const avgEngagement = result.length ? result[0].avgEngagement : 0;
    res.json({ avgEngagementScore: avgEngagement.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Opt-in / Opt-out percentages
exports.getOptInOptOutPercentage = async (req, res) => {
  try {
    const total = await Customer.countDocuments({});
    const optInCount = await Customer.countDocuments({ optOption: "Opt-In" });
    const optOutCount = await Customer.countDocuments({ optOption: "Opt-Out" });

    const optInPercent = total === 0 ? 0 : (optInCount / total) * 100;
    const optOutPercent = total === 0 ? 0 : (optOutCount / total) * 100;

    res.json({
      optInPercent: optInPercent.toFixed(2),
      optOutPercent: optOutPercent.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Average Customer Satisfaction Score (Star Rating)
exports.getCustomerSatisfactionScore = async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: "$satisfactionScore" },
        },
      },
    ]);
    const avgSatisfaction = result.length ? result[0].avgSatisfaction : 0;
    res.json({ avgSatisfactionScore: avgSatisfaction.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
