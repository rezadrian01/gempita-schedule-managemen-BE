const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const mongoose = require("mongoose");
const { config } = require("dotenv");

config();

const seedAdmin = async () => {
  // Connect to the database
  await mongoose.connect(process.env.MONGODB_URI);

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ NIM: process.env.ADMIN_NIM });

  if (!existingAdmin) {
    // Hash the admin password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    // Create admin credentials
    const createAdmin = new Admin({
      NIM: process.env.ADMIN_NIM,
      name: "Admin 1",
      password: hashedPassword,
      isLeader: true,
    });

    await createAdmin.save();

    console.log("Admin created successfully");
  } else {
    console.log("Admin already exists");
  }

  await mongoose.connection.close();
};

seedAdmin()
  .then(() => {
    console.log("Admin seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.log("Error seeding admin:" + err);
    process.exit(1);
  });
