const express = require('express');
const router = express.Router();
const { addStudentId, removeStudentId, getSchedule, addVolunteerId, removeVolunteerId, addAvailableVolunteer, removeAvailableVolunteer, addBackupVolunteer, removeBackupVolunteer, changePicketStatus } = require('../controllers/scheduleController')

router.get('/', getSchedule);

// Student
router.post('/add/student', addStudentId);
router.delete('/remove/student', removeStudentId);

// VolunteerId
router.post('/add/volunteerId', addVolunteerId);
router.delete('/remove/volunteerId', removeVolunteerId);

// Backup Volunteer
router.post('/add/backupVolunteer', addBackupVolunteer);
router.delete('/remove/backupVolunteer', removeBackupVolunteer);

// Available Volunteer
router.post('/add/availableVolunteer', addAvailableVolunteer);
router.delete('/remove/availableVolunteer', removeAvailableVolunteer)


router.put('/changePicketStatus', changePicketStatus);

module.exports = router;