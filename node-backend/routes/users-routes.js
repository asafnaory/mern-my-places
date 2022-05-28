const express = require("express");
const { check } = require("express-validator");
const usersControllters = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();

router.get("/", usersControllters.getUsers);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllters.signup
);

router.post("/login", usersControllters.login);

module.exports = router;
