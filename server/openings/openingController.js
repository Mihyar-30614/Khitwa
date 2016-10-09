var Opening = require('./openingModel.js');
var User =  require('../users/userModel.js');
var Opportunity = require('../opportunities/opportunityModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');

module.exports = {
	allOpenings : function (req, res) {
		Opening.find({status: "Active"})
		.exec(function(error, openings){
			if (openings) {
				res.status(200).send(openings);
			} else {
				helpers.errorHandler(error, req, res);
			}
		});
	},

	closeOpening : function (req, res) {
	},

	deleteOpening : function (req, res) {
	},

	editOpening : function (req, res) {
	},

	applyToOpening : function (req, res) {
	},

	approveVolunteer : function (req, res) {
	},

	rejectVolunteer : function (req, res) {
	},

	getOpening : function (req, res) {
	}
}