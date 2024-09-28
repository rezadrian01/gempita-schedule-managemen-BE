const multer = require("multer");
const path = require("path");

// Multer configuration for image upload
const absenceImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/img/absence"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const KRSFileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/KRS/"))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
})

const uploadAbsenceImg = multer({ storage: absenceImgStorage });
const uploadKRS = multer({ storage: KRSFileStorage })

const uploadSingleImage = uploadAbsenceImg.single("documentation");
const uploadSigleFileKrs = uploadKRS.single('krs')

module.exports = { uploadSingleImage, uploadSigleFileKrs };
