const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");

// Profile Collection (Retention & New customers)
router.get("/profile-collection", controller.getCustomerProfileCollection);

// Profile Overview (Total & Active customers)
router.get("/profile-overview", controller.getCustomerProfileOverview);

// KPI Metrics
router.get("/stats/retention-rate", controller.getCustomerRetentionRate);
router.get("/stats/churn-rate", controller.getChurnRate);
router.get("/stats/engagement-score", controller.getCustomerEngagementScore);
router.get("/stats/optin-optout", controller.getOptInOptOutPercentage);
router.get("/stats/satisfaction-score", controller.getCustomerSatisfactionScore);

module.exports = router;
