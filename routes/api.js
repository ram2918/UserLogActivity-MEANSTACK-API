var express = require("express");
var authRouter = require("./auth");
var userLogsRouter = require("./userLogsController");

var app = express();

app.use("/auth/", authRouter);
app.use("/userLogs/", userLogsRouter);

module.exports = app;