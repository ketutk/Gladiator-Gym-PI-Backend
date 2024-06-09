const express = require("express");
const { middleware, isAdmin, isSuperAdmin } = require("../middleware/middleware");
const { getPackages } = require("../controllers/package.controller");
const router = express.Router();

/* GET users listing. */
router.get("/", getPackages);

module.exports = router;
