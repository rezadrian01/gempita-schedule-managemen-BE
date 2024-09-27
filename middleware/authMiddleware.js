const jwt = require("jsonwebtoken");
const Volunteer = require("../models/volunteer");
const Student = require("../models/student");
const Admin = require("../models/admin");

// Auth Middleware for Volunteer, Student and Admin
const authMiddleware = async (req, res, next) => {
  // Token variable, to store the token value
  let token;

  try {
    // Check if authorization header exists and starts with 'Bearer'
    if (req?.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];

      // Throw an error if the token is missing
      if (!token) {
        errResponse("No token attached to header", 401);
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_TOKEN);

      // Check the decoded NIM in Volunteer, Student, or Admin models
      let currentUser = await Admin.findOne({ NIM: decoded?.nim });
      let role = "Admin";

      if (!currentUser) {
        currentUser = await Student.findOne({ NIM: decoded?.nim });
        role = "Student";
      }
      if (!currentUser) {
        currentUser = await Volunteer.findOne({ NIM: decoded?.nim });
        role = "Volunteer";
      }

      // Attach the user information to the request object
      req.user = { ...currentUser, role };

      return next();
    } else {
      errResponse("No token attached to header", 401);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
