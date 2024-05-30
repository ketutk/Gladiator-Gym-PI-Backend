const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getUser, addUser, login, register, sendVerify, verifyEmail, forgotPassword, resetPassword, whoami, profile, changePassword, deleteUser, getUsers } = require("../controllers/auth.controller");
const router = express.Router();

/* GET users listing. */
router.get("/user", middleware, isSuperAdmin, getUsers);
router.post("/login", login); // add router login
router.post("/register", middleware, isSuperAdmin, register);
router.get("/whoami", middleware, whoami);
router.put("/profile", middleware, profile);
router.put("/password", middleware, changePassword);
router.delete("/:id/delete", middleware, isSuperAdmin, deleteUser);

module.exports = router;
