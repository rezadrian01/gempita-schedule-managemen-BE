const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const volunteerSchema = new Schema({
  NIM: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  programStudy: {
    type: String,
    default: "",
  },
  contact: {
    type: String,
  },
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
