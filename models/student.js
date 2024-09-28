const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const student = new Schema({
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
    default: ""
  },
  contact: {
    type: String,
    default: ""
  },
  KRS: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Student", student);
