const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
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
        required: true
    }
})

module.exports = mongoose.model("Admin", adminSchema)