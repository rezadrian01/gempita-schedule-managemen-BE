const express = require("express");
const router = express.Router();

// Import Auth Middleware
const uploadSingle = require("../middleware/multerMiddleware");

const { recordAttendance } = require("../controllers/absenceController");

router.post("/", uploadSingle, recordAttendance);

module.exports = router;
