const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    programStudy: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Volunteer", volunteerSchema)