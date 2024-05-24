const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getUser, addUser, login, register, sendVerify, verifyEmail, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const router = express.Router();

/* GET users listing. */
router.post("/login", login); // add router login
router.post("/register", middleware, isSuperAdmin, register);

module.exports = router;
