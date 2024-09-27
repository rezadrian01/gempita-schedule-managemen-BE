const Volunteer = require('../models/volunteer');
const Student = require('../models/student');
const Admin = require('../models/admin');
const Schedule = require('../models/schedule');
const Class = require('../models/class');
const { errResponse } = require('../utils/error');

const getSchedule = async (req, res, next) => {
    try {
        // const schedules = await Schedule.find().populate([{ path: 'studentId', path: 'volunteerId', path: 'backupVolunteer', path: 'availableVolunteer' }])
        // res.status(200).json({ success: true, message: "Success get schedules", data: [...schedules] })
        const schedules = await Schedule.aggregate([
            {
                $lookup: {
                    from: "Class",
                    localField: "scheduleId",
                    foreignField: "_id",
                    as: "classDetails"
                }
            },
            {
                $lookup: {
                    from: "Student",
                    localField: "_id",
                    foreignField: "studentId",
                    as: "Student Detail"
                }
            },
            {
                $lookup: {
                    from: 'Volunteer',
                    localField: '_id',
                    foreignField: 'volunteerId',
                    as: 'volunteerId'
                }
            },
            {
                $lookup: {
                    from: 'Volunteer',
                    localField: '_id',
                    foreignField: 'backupVolunteer',
                    as: 'backupVolunteer'
                }
            },
            {
                $lookup: {
                    from: 'Volunteer',
                    localField: '_id',
                    foreignField: 'availableVolunteer',
                    as: 'availableVolunteer'
                }
            },
            {
                $sort: {
                    day: 1,
                    time: 1
                }
            }
        ])
        res.status(200).json({ success: true, message: "Success get schedules", data: schedules })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err)
    }
}

const addStudentId = async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!currentUser.isLeader) errResponse("Access denied", 403);
        const { startTime, endTime, day, studentId } = req.body;

        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) errResponse("Student not found", 404);

        // Lopping schedule 
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findById({ day, time: startTime });
            if (existingSchedule) {
                existingSchedule.studentId.push(studentId);
                await existingSchedule.save();
            } else {
                const newSchedule = new Schedule({
                    day,
                    time: startTime,
                    studentId: existingStudent,
                })
                await newSchedule.save();
            }
        }

        res.status(201).json({ success: true, message: "Success add student to schedule" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}
const addVolunteerId = async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!currentUser.isLeader) errResponse("Access denied", 403);
        const existingVolunteer = await Volunteer.findById()
        if (!existingVolunteer) errResponse("Volunteer not found", 404);

        const { volunteerId, startTime, endTime, day } = req.body;

        // Lopping schedule
        while (startTime < endTime) {
            const existingSchedule = await Schedule.find({ day, time: startTime })
            if (existingSchedule) {
                existingSchedule.volunteerId.push(volunteerId);
                await existingSchedule.save();
            } else {
                const newSchedule = new Schedule({
                    day,
                    time: startTime,
                    volunteerId
                })
                await newSchedule.save();
            }
        }

        res.status(201).json({ success: true, message: "Success add volunteer to schedule" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}
const addBackupVolunteer = async (req, res, next) => {
    try {

    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}


const addAvailableVolunteer = async (req, res, next) => {
    try {
        let isClassSchedule = false;
        const currentUser = await Volunteer.findOne({ NIM: req.id });
        if (!currentUser) {
            isClassSchedule = true
            currentUser = await Student.findOne({ NIM: req.id }) || await Student.findOne({ NIM: req.body.nim });
        }

    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const changePicketStatus = async (req, res, next) => {
    try {

    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}



module.exports = { getSchedule, addStudentId, addVolunteerId }