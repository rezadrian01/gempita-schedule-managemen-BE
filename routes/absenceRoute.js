const express = require("express");
const router = express.Router();

// Import Auth Middleware
const uploadSingle = require("../middleware/multerMiddleware");

const {
  recordAttendance,
  viewAbsence,
} = require("../controllers/absenceController");

// View absence
router.get("/", viewAbsence);

// Add absence
router.post("/", uploadSingle, recordAttendance);

module.exports = router;
