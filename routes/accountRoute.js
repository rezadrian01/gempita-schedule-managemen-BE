const express = require("express");
const router = express.Router();
const { uploadSigleFileKrs } = require('../middleware/multerMiddleware');
const {
  getProfile,
  updateProfile,
  createNewAdmin,
  deleteAdmin,
  swapAdminLeader,
  uploadKRS
} = require("../controllers/accountController");

router.get("/", getProfile);
router.put("/update", updateProfile);
router.post('/student/krs', uploadSigleFileKrs, uploadKRS);
router.post("/admin/new", createNewAdmin);
router.delete('/admin/delete', deleteAdmin);
router.post('/admin/swapAdminLeader', swapAdminLeader);

module.exports = router;
