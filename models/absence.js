const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absenceSchema = new Schema({
  volunteerId: {
    type: Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  confirmation: {
    type: String,
    required: true,
  },
  documentation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Absence", absenceSchema);
