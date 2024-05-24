const express = require("express");
const router = express.Router();
const authRoute = require("./auth");

/* GET home page. */
router.use("/auth", authRoute);

module.exports = router;
