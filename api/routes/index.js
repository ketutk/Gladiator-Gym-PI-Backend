const express = require("express");
const router = express.Router();
const authRoute = require("./auth");
const memberRoute = require("./member");
const paymentRoute = require("./payment");
const packageRoute = require("./package");

/* GET home page. */
router.use("/auth", authRoute);
router.use("/member", memberRoute);
router.use("/payments", paymentRoute);
router.use("/package", packageRoute);

module.exports = router;
