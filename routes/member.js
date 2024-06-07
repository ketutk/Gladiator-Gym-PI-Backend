const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getMembers, createMember, deleteMemberById, getAllMember, updateMemberById, getMemberByEmail } = require("../controllers/member.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", middleware, isAdmin, getMembers);
router.get("/all", middleware, isAdmin, getAllMember);
router.get("/:email", getMemberByEmail);
router.put("/:id", middleware, isAdmin, updateMemberById);
router.post("/", middleware, isAdmin, createMember);
router.delete("/:id", middleware, isSuperAdmin, deleteMemberById);

module.exports = router;
