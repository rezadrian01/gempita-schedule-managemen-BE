const { errResponse } = require("../utils/error");
const Absence = require("../models/absence");

// Function to record attendance
const recordAttendance = async (req, res, next) => {
  // Get id user
  const { _id } = req.user._doc;

  // Get filename from the file
  const { filename } = req.file;

  // Get data from user
  const { studentId, date, confirmation } = req.body;

  try {
    // Check if file(image documentation) is uploaded
    if (!req.file) errResponse("No image file uploaded", 400);

    // Create absence data
    const createAbsence = new Absence({
      volunteerId: _id,
      studentId,
      date,
      confirmation,
      documentation: filename,
    });

    // Save absence data
    await createAbsence.save();

    // Response
    res.status(201).json({
      message: "Data has been successfully created!",
      data: createAbsence,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

module.exports = { recordAttendance };
