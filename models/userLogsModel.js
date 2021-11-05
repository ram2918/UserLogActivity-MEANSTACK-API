var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userLogsSchema = new Schema({
	browserName: {type: String},
	browserVersion: {type: String},
	email: {type: String},
	ipAddress: {type: String},

	
}, {timestamps: true});

module.exports = mongoose.model("userLogs", userLogsSchema);