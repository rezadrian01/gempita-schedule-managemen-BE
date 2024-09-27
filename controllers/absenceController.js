const { errResponse } = require("../utils/error");
const Absence = require("../models/absence");

// Function to record attendance
const recordAttendance = async (req, res, next) => {
  // Get user id
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

// Function to view absence history
const viewAbsence = async (req, res, next) => {
  // Get user id
  const { _id } = req.user._doc;

  try {
    // Get absence data by volunteer id
    const getAbsenceByVolunteerId = await Absence.findOne({ volunteerId: _id });

    // Response data to client
    res
      .status(200)
      .json({ message: "Request successfully", data: getAbsenceByVolunteerId });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

module.exports = { recordAttendance, viewAbsence };
