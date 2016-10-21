var Opportunity = require('./opportunityModel.js');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');
// var User = require('../users/userModel.js');
var Q = require('q');
var helpers = require('../config/helpers.js');
var jwt = require('jwt-simple');

module.exports = {
	
	allOpportunities : function (req, res) {
		Opportunity.find({})
		.exec(function(error, opportunities){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else {
				res.status(200).send(opportunities)
			}
		});
	},

	addOpening: function (req, res) {
		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		} else {
			var openingId;
			var opportunityId = req.params.id;
			var newOpening = new Opening({
				title : req.body.title,
				_opportunity : opportunityId,
				numberOfVolunteers : req.body.numberOfVolunteers,
				location : req.body.location,
				description : req.body.description,
				skillsRequired : req.body.skillsRequired,
				resources : req.body.resources,
				status : req.body.status
			})
			newOpening.save(function (error, saved) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else {
					openingId = saved._id;
					console.log('Opening Created');
				}
			})
			Opportunity.findOne({_id : opportunityId})
			.exec(function (error, opportunity) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else if (opportunity) {
					opportunity.currOpenings.push(openingId);
					opportunity.save(function (error, saved) {
						if (error) {
							helpers.errorHandler(error, req, res);
						} else {
							res.status(201).send('Opening Added');
						}
					})
				}else{
					helpers.errorHandler('Opportunity Not Found');
				}
			})
		}
	},

	editOpportunity : function (req,res) {
  	},

  	getCurrOpenings: function (req,res) {
	},

	getClosedOpenings: function (req,res) {
	},

	getOpportunity : function (req, res) {
		var id = req.params.id.toString();
		Opportunity.findOne({ _id : id})
		.exec(function (error, opportunity) {
			if (opportunity) {
				res.status(200).send(opportunity)
			} else {
				helpers.errorHandler('Opportunity Not Found', req, res);
			}
		});
	},

	getOpportunityByOrgId : function (req, res) {
		var id = req.params.id.toString();
		Opportunity.find({_organizer : id})
		.exec(function (error, opportunity) {
			if (opportunity) {
				res.status(200).send(opportunity);
			} else {
				helpers.errorHandler(error, req, res);
			}
		});
	},

	deleteOne : function(req,res){
	}
}