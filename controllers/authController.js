const Student = require("../models/student");
const Volunteer = require("../models/volunteer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errResponse } = require("../utils/error");

// Register function for Volunteer and Student
const register = async (req, res) => {
  const { nim, name, password, confirmPassword, role } = req.body;

  try {
    // Check if the password is not the same as confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password must be the same" });
    }

    // Hashed password using bcrypt
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If the role is volunteer then the code below will be executed
    if (role === "volunteer") {
      // Creating Volunteer data
      const newVolunteer = new Volunteer({
        NIM: nim,
        name: name,
        password: hashedPassword,
      });

      // Save data to the database
      await newVolunteer.save();

      // Creating a token using jsonwebtoken
      jwt.sign({ nim: nim }, process.env.JWT_TOKEN, (error, token) => {
        if (error) {
          errResponse("Internal Server Error", 500);
        }

        res
          .cookie("token", token, {
            httpOnly: true,
          })
          .json(newVolunteer);
      });
    }

    // If the role is other than volunteer then the code below will be executed
    // Creating Student data
    const newStudent = new Student({
      NIM: nim,
      name: name,
      password: hashedPassword,
    });

    // Save data to the database
    newStudent.save();

    // Creating a token using jsonwebtoken
    jwt.sign({ nim: nim }, process.env.JWT_TOKEN, (error, token) => {
      if (error) {
        errResponse("Internal Server Error", 500);
      }

      res
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(newStudent);
    });
  } catch (err) {
    errResponse("Internal Server Error", 500);
  }
};

module.exports = { register };
