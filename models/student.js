const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const student = new Schema({
    NIM: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    programStudy: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Student', student)