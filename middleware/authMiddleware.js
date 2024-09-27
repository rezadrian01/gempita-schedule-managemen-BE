const jwt = require("jwt");
const Volunteer = require("../models/volunteer");
const Student = require("../models/student");
const Admin = require("../models/admin");

const authMiddleware = async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const id =
          (await Volunteer.findById(decoded?.id)) ||
          (await Student.findById(decoded?.id)) ||
          (await Admin.findById(decoded?.id));

        req.id = id;

        next();
      }
    } catch (err) {
      errResponse("Not Authorized: Token expired, please login again", 401);
    }
  } else {
    errResponse("No token attached to header", 401);
  }
};

module.exports = authMiddleware;
