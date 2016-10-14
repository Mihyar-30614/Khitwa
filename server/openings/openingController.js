var Opening = require('./openingModel.js');
var User =  require('../users/userModel.js');
var Opportunity = require('../opportunities/opportunityModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');

var updateOpportunity = Q.nbind(Opportunity.update, Opportunity);
var updateOneOpportunity = Q.nbind(Opportunity.findOneAndUpdate, Opportunity);
var findOpening = Q.nbind(Opening.findOne, Opening);

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
		var openingId = req.params.id.toString();
  		var token = req.headers['x-access-token'];
  		if (!token){
  			helpers.errorHandler('No Token', req, res);
  		} else {
  			findOpening({"_id":openingId})
		  	.then(function (opening) {
			    if (opening) {
			    	var opportunityId = opening._opportunity;
            		opening.status = "Closed";
			    	opening.save();
			    	updateOpportunity({ _id: opportunityId }, { $pull: { currOpenings: openingId } })
			    	.fail(function (err) {
				    	helpers.errorHandler(err, req, res);
		  			})
		  			updateOneOpportunity({ _id: opportunityId}, { $push: { closedOpenings: openingId } },
      				{ new: true })
      				.then(function(opportunity){
						return opportunity.closedOpenings;
      				})
      				.then(function(closed){
      					findAllOpenings({'_id': { $in: closed}})
				        .then(function(allOpenings){
				          res.status(200).send(allOpenings);
				        })
      				})
      				.fail(function(err){
      					helpers.errorHandler(err, req, res);
      				})
			   	}})
		    .fail(function (error) {
		        helpers.errorHandler(error, req, res);
		 	})
		}
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