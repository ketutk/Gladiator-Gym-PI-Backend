const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getActiveMember, getTransactions, getTotalTransactions, getTransactionsByPakcage, getDashboardData } = require("../controllers/dashboard.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", middleware, getDashboardData);
router.get("/transactions/packages", middleware, getTransactionsByPakcage);

module.exports = router;
