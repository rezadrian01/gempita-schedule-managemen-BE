const Volunteer = require('../models/volunteer');
const Student = require('../models/student');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');

const { errResponse } = require('../utils/error')

const getProfile = async (req, res, next) => {
    try {
        //Check Existing User
        const currentUser = req.user._doc;
        if (!currentUser) errResponse("Account not found", 404)
        delete currentUser.password;
        res.status(200).json({ success: true, message: "Success get profile", data: { ...currentUser } })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const updateProfile = async (req, res, next) => {
    try {
        //Check Existing User
        const tempUser = req.user._doc;
        if (!tempUser) errResponse("Account not found", 404);

        let currentUser = await Admin.findById(tempUser);
        if (!currentUser) currentUser = await Student.findById(tempUser);
        if (!currentUser) currentUser = await Volunteer.findById(tempUser);

        const { contact, currentPassword, newPassword, confirmNewPassword } = req.body;
        currentUser.contact = contact;
        if (currentPassword && newPassword && confirmNewPassword) {
            const passwordIsCorrect = await bcrypt.compare(currentPassword, currentUser.password)
            if (!passwordIsCorrect) {
                errResponse("Wrong password", 401)
            }
            if (newPassword !== confirmNewPassword) {
                errResponse("Password must to be same", 401)
            }
            currentUser.password = await bcrypt.hash(newPassword, 12)
        }
        await currentUser.save()
        res.status(200).json({ success: true, message: "Success update profile" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const createNewAdmin = async (req, res, next) => {
    try {
        const currentAdmin = req.user._doc;

        //Validation
        if (!currentAdmin) errResponse("Admin not found", 404);
        if (!currentAdmin?.isLeader) errResponse("Access denied", 403);

        const { nim, name, password } = req.body;
        const newAdmin = new Admin({
            NIM: nim,
            name: name,
            password: await bcrypt.hash(password, 12)
        })
        await newAdmin.save()
        res.status(201).json({ success: true, message: "Success create new admin" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const deleteAdmin = async (req, res, next) => {
    try {
        if (req?.user?.role?.toLowerCase() !== 'admin') errResponse("Access denied", 403);
        const currentAdmin = req.user._doc;
        if (!currentAdmin.isLeader) errResponse("Access denied", 403);

        const { nim } = req.body;
        const existingAdmin = await Admin.findOne({ NIM: nim });
        if (!existingAdmin) errResponse("Admin not found", 404);
        await Admin.findByIdAndDelete(existingAdmin);
        res.status(200).json({ success: true, message: "Success delete admin" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const swapAdminLeader = async (req, res, next) => {
    try {
        if (!req?.user?.role.toLowerCase() === 'admin') errResponse("Access denied", 403);
        delete req.user.role;
        const currentAdminLeader = await Admin.findById(req.user._doc._id);
        if (!currentAdminLeader.isLeader) errResponse("Only admin leader can do this action", 403)

        const { adminId } = req.body;
        const existingAdmin = await Admin.findById(adminId);
        if (!existingAdmin) errResponse("Admin with that ID not found", 404);

        currentAdminLeader.isLeader = false;
        existingAdmin.isLeader = true;

        await currentAdminLeader.save();
        await existingAdmin.save();
        res.status(200).json({ success: true, message: "Success swap admin leader" })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

module.exports = { getProfile, updateProfile, createNewAdmin, deleteAdmin, swapAdminLeader }