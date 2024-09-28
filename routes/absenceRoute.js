const express = require("express");
const router = express.Router();

// Import Auth Middleware
const { uploadSingleImage } = require("../middleware/multerMiddleware");

const {
  recordAttendance,
  viewAbsence,
} = require("../controllers/absenceController");

// View absence
router.get("/", viewAbsence);

// Add absence
router.post("/", uploadSingleImage, recordAttendance);

module.exports = router;
