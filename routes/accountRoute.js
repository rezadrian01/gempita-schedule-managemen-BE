const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, createNewAdmin } = require('../controllers/accountController');

router.get('/', getProfile);
router.put('/update', updateProfile);
router.post('/newAdmin', createNewAdmin);

module.exports = router