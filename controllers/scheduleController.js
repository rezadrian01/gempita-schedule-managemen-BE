const Volunteer = require('../models/volunteer');
const Student = require('../models/student');
const Admin = require('../models/admin');
const Schedule = require('../models/schedule');
const Class = require('../models/class');
const { errResponse } = require('../utils/error');

const getSchedule = async (req, res, next) => {
    try {
        const schedules = await Schedule.aggregate([
            {
                $lookup: {
                    from: "classes",
                    localField: "_id",
                    foreignField: "scheduleId",
                    as: "classDetails"
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "students"
                }
            },
            {
                $lookup: {
                    from: 'volunteers',
                    localField: 'volunteerId',
                    foreignField: '_id',
                    as: 'volunteerId'
                }
            },
            {
                $lookup: {
                    from: 'volunteers',
                    localField: 'backupVolunteer',
                    foreignField: '_id',
                    as: 'backupVolunteer'
                }
            },
            {
                $lookup: {
                    from: 'volunteers',
                    localField: 'availableVolunteer',
                    foreignField: '_id',
                    as: 'availableVolunteer'
                }
            },
            {
                $sort: {
                    day: 1,
                    time: 1
                }
            },
            {
                $project: {
                    students: {
                        password: 0
                    },
                    availableVolunteer: {
                        password: 0
                    }
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
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403);

        const { endTime, day, studentId, subject, building, room, floor, note } = req.body;
        let { startTime } = req.body;

        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) errResponse("Student not found", 404);
        // Lopping schedule 
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            let currentSchedule = existingSchedule;
            if (currentSchedule) {
                currentSchedule.studentId.push(existingStudent);
                await currentSchedule.save();
            } else {
                currentSchedule = new Schedule({
                    day,
                    time: startTime,
                    studentId: existingStudent,
                })
                await currentSchedule.save();
            }
            const newClass = new Class({
                scheduleId: currentSchedule,
                studentId: existingStudent,
                subject,
                building,
                room,
                floor,
                note: note || ""
            })
            await newClass.save();
            startTime++
        }

        res.status(201).json({ success: true, message: "Success add student to schedule" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const removeStudentId = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403);
        const { endTime, day, studentId } = req.body;
        let { startTime } = req.body;

        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) errResponse("Student not found", 404);

        // Lopping schedule 
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            const existingClass = await Class.findOne({ scheduleId: existingSchedule, studentId })
            if (!existingSchedule) errResponse("Schedule not found", 404);
            if (!existingClass) errResponse("Class not found", 404);

            await Class.findByIdAndDelete(existingClass);
            existingSchedule.studentId.pull(existingStudent);

            await existingSchedule.save();
            startTime++;
        }
        res.status(201).json({ success: true, message: "Success remove student from schedule" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const addVolunteerId = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403);

        const { volunteerId, endTime, day } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);


        // Lopping schedule
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime })
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
            startTime++;
        }

        res.status(201).json({ success: true, message: "Success add volunteer to schedule" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const removeVolunteerId = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403);

        const { volunteerId, endTime, day } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);


        // Lopping schedule
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404);
            existingSchedule.volunteerId.pull(volunteerId);
            await existingSchedule.save();
            startTime++;
        }

        res.status(201).json({ success: true, message: "Success remove volunteer from schedule" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err)
    }
}

const addBackupVolunteer = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403)

        const { endTime, day, volunteerId } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);

        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (existingSchedule) {
                existingSchedule.backupVolunteer.push(volunteerId);
                await existingSchedule.save();
            } else {
                const newSchedule = new Schedule({
                    day,
                    time: startTime,
                    backupVolunteer: volunteerId
                })
                await newSchedule.save();
            }
            startTime++;
        }
        res.status(201).json({ success: true, message: "Success add backup volunteer to schedule" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const removeBackupVolunteer = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Admin') errResponse("Access denied", 403)

        const { endTime, day, volunteerId } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);

        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404)
            existingSchedule.backupVolunteer.pull(volunteerId)
            await existingSchedule.save()
            startTime++;
        }
        res.status(201).json({ success: true, message: "Success remove backup volunteer from schedule" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err)
    }
}


const addAvailableVolunteer = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Volunteer') errResponse("Access denied", 403);

        const { endTime, day } = req.body;
        let { startTime } = req.body;

        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (existingSchedule) {
                existingSchedule.availableVolunteer.push(currentUser);
                await existingSchedule.save();
            } else {
                const newSchedule = new Schedule({
                    day,
                    time: startTime,
                    availableVolunteer: currentUser
                })
                await newSchedule.save();
            }
            startTime++;
        }
        res.status(201).json({ success: true, message: "Success add available volunteer to schedule" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const removeAvailableVolunteer = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role !== 'Volunteer') errResponse("Access denied", 403);
        const { endTime, day } = req.body;
        let { startTime } = req.body;

        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404);
            const availableVolunteerIndex = existingSchedule.availableVolunteer.findIndex(volunteer => volunteer._id.toString() === currentUser._id.toString());
            if (availableVolunteerIndex === -1) errResponse("Volunteer not found in available volunteer field")


            existingSchedule.availableVolunteer.pull(currentUser);
            await existingSchedule.save();
            startTime++;
        }
        res.status(201).json({ success: true, message: "Success remove available volunteer from schedule" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err)
    }
}

const changePicketStatus = async (req, res, next) => {
    try {
        const currentUser = { ...req.user._doc, role: req.user.role };
        if (currentUser.role === 'Student') errResponse("Access denied", 403);
        const { startTime, endTime, day, status, volunteerId } = req.body;

        // Lopping schedule
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404);
            const existingVolunteerIndex = existingSchedule.volunteerId.findIndex(volunteer => volunteer._id === volunteerId);
            if (existingVolunteerIndex === -1) errResponse("Schedule dont have volunteer id yet", 404);
            existingSchedule.status[existingVolunteerIndex] = status;
            await existingSchedule.save();
        }
        res.status(201).json({ success: true, message: "Success update picket status" })

    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}



module.exports = { getSchedule, addStudentId, removeStudentId, addVolunteerId, removeVolunteerId, addBackupVolunteer, removeBackupVolunteer, addAvailableVolunteer, removeAvailableVolunteer, changePicketStatus }