const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    day: {
        type: Number,
        required: true,
        default: "Senin"
    },
    time: {
        type: Number,
        required: true
    },
    studentId: [{
        type: Schema.Types.ObjectId,
        ref: "Student",
    }],
    volunteerId: {
        type: Schema.Types.ObjectId,
        ref: "Volunteer",
    },
    backupVolunteer: {
        type: Schema.Types.ObjectId,
        ref: "Volunteer"
    },
    availableVolunteer: [{
        type: Schema.Types.ObjectId,
        ref: "Volunteer"
    }],
    status: {
        type: String,
        default: "On Schedule",
        required: true
    }
})

module.exports = mongoose.model("Schedule", scheduleSchema)