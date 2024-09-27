const express = require('express');
const router = express.Router();
const { getSchedule } = require('../controllers/scheduleController')

router.get('/', getSchedule)

module.exports = router;