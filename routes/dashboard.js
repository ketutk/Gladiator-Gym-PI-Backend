const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getMember, getActiveMember, getTransactions, getTotalTransactions, getTransactionsByPakcage } = require("../controllers/dashboard.controller");
const router = express.Router();

/* GET users listing. */
router.get("/member", middleware, getMember);
router.get("/member/active", middleware, getActiveMember);
router.get("/transactions", middleware, getTransactions);
router.get("/transactions/total", middleware, getTotalTransactions);
router.get("/transactions/packages", middleware, getTransactionsByPakcage);

module.exports = router;
