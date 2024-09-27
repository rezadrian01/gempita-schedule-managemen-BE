const express = require('express');
const router = express.Router();
const { getSchedule, addVolunteerId } = require('../controllers/scheduleController')

router.get('/', getSchedule)
router.post('/add/volunteerId', addVolunteerId)

module.exports = router;