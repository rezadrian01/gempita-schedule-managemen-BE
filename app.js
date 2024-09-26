const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const { config } = require("dotenv");
const cors = require("cors");
const { errResponse } = require("./utils/error");
// Auth Router
const authRoute = require("./routes/authRoute");

config();
const app = express();
const VERSION = "/api/v1";

app.use(cors()).use(bodyParser.json());

// Auth API
app.use(`${VERSION}/auth`, authRoute);

app.use((err, req, res, next) => {
  const msg = err.message || "An Error Occured";
  const data = err.data || [];
  const statusCode = err.statusCode;
  res.status(statusCode).json({ success: false, message: msg, data });
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
  });
});
