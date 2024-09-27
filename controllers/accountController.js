const Volunteer = require('../models/volunteer');
const Student = require('../models/student');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');

const { errResponse } = require('../utils/error')

const getProfile = async (req, res, next) => {
    try {
        //Check Existing User
        const currentUser = req.user;
        if (!currentUser) errResponse("Account not found", 404)
        delete currentUser.role;
        delete currentUser.password;
        res.status(200).json({ success: true, message: "Success get profile", data: { ...currentUser._doc } })
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err)
    }
}

const updateProfile = async (req, res, next) => {
    try {
        //Check Existing User
        currentUser = req.user;
        if (!currentUser) errResponse("Account not found", 404);

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
        const currentAdmin = req.user;

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

module.exports = { getProfile, updateProfile, createNewAdmin }