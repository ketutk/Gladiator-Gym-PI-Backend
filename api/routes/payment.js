const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getPayments, createPayment, getPaymentsMember, getPaymentById } = require("../controllers/payment.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", middleware, isAdmin, getPayments);
router.get("/:id", middleware, isAdmin, getPaymentById);
router.get("/member/:member_id", middleware, isAdmin, getPaymentsMember);
router.post("/", middleware, isAdmin, createPayment);

module.exports = router;
