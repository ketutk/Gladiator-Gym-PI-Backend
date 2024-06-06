// Module
require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");

const indexRouter = require("../routes/index");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Route
app.use("/api/v1", indexRouter);

// 500 error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    status: false,
    message: "Server Error, Failed to process",
    error: err.message,
    data: null,
  });
});

// 404 error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: `are you lost? ${req.method} ${req.url} is not registered!`,
    data: null,
  });
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
