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
                    studentId: 0,
                    students: {
                        password: 0
                    },
                    availableVolunteer: {
                        password: 0
                    },
                    backupVolunteer: {
                        password: 0
                    },
                    volunteerId: {
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

const searchSchedule = async (req, res, next) => {
    try {
        const { searchTerm } = req.params;
        const schedules = await Schedule.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'students'
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
                $match: {
                    $or: [
                        {
                            'students.name': { $regex: searchTerm, $options: 'i' }
                        },
                        {
                            'volunteerId.name': { $regex: searchTerm, $options: 'i' }
                        },
                        {
                            'backupVolunteer.name': { $regex: searchTerm, $options: 'i' }
                        },
                        {
                            'availableVolunteer.name': { $regex: searchTerm, $options: 'i' }
                        },
                        {
                            'day': { $eq: +searchTerm }
                        },
                        {
                            'time': { $eq: +searchTerm }
                        }
                    ]
                }
            },
            {
                $project: {
                    studentId: 0,
                    students: {
                        password: 0
                    },
                    availableVolunteer: {
                        password: 0
                    },
                    backupVolunteer: {
                        password: 0
                    },
                    volunteerId: {
                        password: 0
                    }
                }
            }
        ])
        res.status(200).json({ success: true, message: "Success get schedule", data: schedules })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
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
            if (!existingSchedule) errResponse("Schedule not found", 404)
            const existingAvailableVolunteerIndex = existingSchedule.availableVolunteer.findIndex(volunteer => volunteer._id.toString() === volunteer._id.toString());
            if (existingAvailableVolunteerIndex === -1) errResponse("Volunteer must have available schdule on that time", 422)
            existingSchedule.availableVolunteer.pull(volunteerId)
            existingSchedule.volunteerId.push(volunteerId);

            await existingSchedule.save();
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

        const { volunteerId, endTime, isSwitch = true, day } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);

        // Lopping schedule
        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404);
            existingSchedule.volunteerId.pull(volunteerId);

            // Switch to available volunteer
            if (isSwitch) existingSchedule.availableVolunteer.push(volunteerId);

            await existingSchedule.save();
            startTime++;
        }

        let message = "Success remove volunteer from schedule"
        if (isSwitch) message = "Success switch volunteer to available volunteer";
        res.status(201).json({ success: true, message })
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
            if (!existingSchedule) errResponse("Schedule not found", 404);

            existingSchedule.backupVolunteer.push(volunteerId);
            existingSchedule.availableVolunteer.pull(volunteerId);
            await existingSchedule.save();
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

        const { endTime, day, isSwitch = true, volunteerId } = req.body;
        let { startTime } = req.body;

        const existingVolunteer = await Volunteer.findById(volunteerId);
        if (!existingVolunteer) errResponse("Volunteer not found", 404);

        while (startTime < endTime) {
            const existingSchedule = await Schedule.findOne({ day, time: startTime });
            if (!existingSchedule) errResponse("Schedule not found", 404)

            existingSchedule.backupVolunteer.pull(volunteerId)
            if (isSwitch) existingSchedule.availableVolunteer.push(volunteerId);
            await existingSchedule.save()
            startTime++;
        }
        let message = "Success remove backup volunteer from schedule";
        if (isSwitch) message = "Success switch volunteer to available volunteer";
        res.status(201).json({ success: true, message });
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
            const existingVolunteerIndex = existingSchedule.volunteerId.findIndex(volunteer => volunteer._id.toString() === volunteerId);
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



module.exports = { getSchedule, searchSchedule, addStudentId, removeStudentId, addVolunteerId, removeVolunteerId, addBackupVolunteer, removeBackupVolunteer, addAvailableVolunteer, removeAvailableVolunteer, changePicketStatus }