const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
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
    contact: {
        type: String,
        default: ""
    },
    isLeader: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model("Admin", adminSchema)