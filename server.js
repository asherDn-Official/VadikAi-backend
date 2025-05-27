const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");

require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const retailerRoutes = require("./routes/retailerRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const campaignRoutes = require("./routes/campaignRoutes");

const dailyJobRunner = require("./scheduler/jobRunner");

const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Routes
app.use("/admin", adminRoutes);
app.use("/retailer", retailerRoutes);
app.use("/password", passwordRoutes);
app.use("/customer", customerRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/campaigns", campaignRoutes);

app.use("/products", productRoutes);


// Schedule the job to run every midnight
cron.schedule("0 0 * * *", dailyJobRunner);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
