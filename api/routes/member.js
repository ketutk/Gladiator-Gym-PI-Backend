const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getMembers, createMember, getMemberById, deleteMemberById } = require("../controllers/member.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", middleware, isAdmin, getMembers);
router.get("/:id", middleware, isAdmin, getMemberById);
router.post("/", middleware, isAdmin, createMember);
router.delete("/:id", middleware, isSuperAdmin, deleteMemberById);

module.exports = router;
