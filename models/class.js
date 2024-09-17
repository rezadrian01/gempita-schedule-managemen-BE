const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    scheduleId: {
        type: Schema.Types.ObjectId,
        ref: "Schedule"
    },
    subject: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model("Class", classSchema)