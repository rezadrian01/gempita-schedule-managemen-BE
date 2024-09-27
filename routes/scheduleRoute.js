const express = require('express');
const router = express.Router();
const { addStudentId, removeStudentId, getSchedule, addVolunteerId, removeVolunteerId, addAvailableVolunteer, removeAvailableVolunteer, addBackupVolunteer, removeBackupVolunteer, changePicketStatus } = require('../controllers/scheduleController')

router.get('/', getSchedule);

router.post('/add/student', addStudentId);
router.post('/remove/student', removeStudentId);

router.post('/add/volunteerId', addVolunteerId);
router.post('/remove/volunteerId', removeVolunteerId);

router.post('/add/backupVolunteer', addBackupVolunteer);
router.post('/remove/backupVolunteer', removeBackupVolunteer);

router.post('/add/availableVolunteer', addAvailableVolunteer);
router.post('/remove/availableVolunteer', removeAvailableVolunteer)


router.put('/changePicketStatus', changePicketStatus);

module.exports = router;