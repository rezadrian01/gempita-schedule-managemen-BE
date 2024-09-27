const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const { config } = require("dotenv");
const cors = require("cors");

// Routes
const authRoute = require("./routes/authRoute");
const accountRoute = require("./routes/accountRoute");
const scheduleRoute = require("./routes/scheduleRoute");
const absenceRoute = require("./routes/absenceRoute");

// Middleware
const authMiddleware = require("./middleware/authMiddleware");

config();
const app = express();
const VERSION = "/api/v1";

app.use(cors()).use(bodyParser.json());

// API
app.use(`${VERSION}/auth`, authRoute);

app.use("/", authMiddleware);
app.use(`${VERSION}/account`, accountRoute);
app.use(`${VERSION}/schedule`, scheduleRoute);
app.use(`${VERSION}/absence`, absenceRoute);

app.use((err, req, res, next) => {
  const msg = err.message || "An Error Occured";
  const data = err.data || [];
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, message: msg, data });
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
  });
});
