const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");


require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const retailerRoutes = require("./routes/retailerRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const customerRoutes = require("./routes/customerRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");

// const campaignRoutes = require("./routes/campaignRoutes");

// const dailyJobRunner = require("./scheduler/jobRunner");

const productRoutes = require('./routes/productRoutes');

const orderRoutes = require('./routes/orderRoutes');

const chatRoutes = require('./routes/chatRoutes');

const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
app.use(express.json());

//cors policy

app.use(cors());

app.use(express.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
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
app.use("/api/admin", adminRoutes);
app.use("/api/retailer", retailerRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/customer", customerRoutes);
// app.use("/dashboard", dashboardRoutes);

// app.use("/campaigns", campaignRoutes);

app.use("/api/products", productRoutes);

app.use('/api/orders', orderRoutes);

app.use("/api/employee", employeeRoutes);


//for chatbot

app.use('/api/chat', chatRoutes);

// Schedule the job to run every midnight
// cron.schedule("0 0 * * *", dailyJobRunner);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
