const userLogs = require("../models/userLogsModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// userLogs Schema
function userLogsData(data) {
	this.id = data._id;
	this.title= data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * userLogs List.
 * 
 * @returns {Object}
 */
exports.userLogsList = [

	function (req, res) {
		try {
			console.log(req.body);
			userLogs.find().then((userLogss)=>{
				console.log(userLogss.length);
				if(userLogss.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", userLogss);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * userLogs Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.userLogsDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			userLogs.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((userLogs)=>{                
				if(userLogs !== null){
					let userLogsData = new userLogsData(userLogs);
					return apiResponse.successResponseWithData(res, "Operation success", userLogsData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * userLogs store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.userLogsStore = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return userLogs.findOne({isbn : value,user: req.user._id}).then(userLogs => {
			if (userLogs) {
				return Promise.reject("userLogs already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var userLogs = new userLogs(
				{ title: req.body.title,
					user: req.user,
					description: req.body.description,
					isbn: req.body.isbn
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save userLogs.
				userLogs.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let userLogsData = new userLogsData(userLogs);
					return apiResponse.successResponseWithData(res,"userLogs add Success.", userLogsData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * userLogs update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.userLogsUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return userLogs.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(userLogs => {
			if (userLogs) {
				return Promise.reject("userLogs already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var userLogs = new userLogs(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					userLogs.findById(req.params.id, function (err, founduserLogs) {
						if(founduserLogs === null){
							return apiResponse.notFoundResponse(res,"userLogs not exists with this id");
						}else{
							//Check authorized user
							if(founduserLogs.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update userLogs.
								userLogs.findByIdAndUpdate(req.params.id, userLogs, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let userLogsData = new userLogsData(userLogs);
										return apiResponse.successResponseWithData(res,"userLogs update Success.", userLogsData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * userLogs Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.userLogsDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			userLogs.findById(req.params.id, function (err, founduserLogs) {
				if(founduserLogs === null){
					return apiResponse.notFoundResponse(res,"userLogs not exists with this id");
				}else{
					//Check authorized user
					if(founduserLogs.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete userLogs.
						userLogs.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"userLogs delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];