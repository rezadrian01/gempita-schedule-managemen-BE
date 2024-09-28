const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  createNewAdmin,
  deleteAdmin,
  swapAdminLeader
} = require("../controllers/accountController");

router.get("/", getProfile);
router.put("/update", updateProfile);
router.post("/admin/new", createNewAdmin);
router.delete('/admin/delete', deleteAdmin);
router.post('/admin/swapAdminLeader', swapAdminLeader);

module.exports = router;
