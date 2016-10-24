var Opportunity = require('./opportunityModel.js');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');
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
			var opportunityId = req.params.id.toString();
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
		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		} else {
			var id = req.params.id.toString();
			Opportunity.findOne({_id : id})
			.exec(function (error, opportunity) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else if (opportunity) {
					orgna = jwt.decode(token,'secret');
					if (opportunity._organizer === orgna.name) {
						opportunity.title = req.body.title || opportunity.title;
	  					opportunity.startDate = req.body.startDate || opportunity.startDate;
	  					opportunity.endDate = req.body.endDate || opportunity.endDate;
	  					opportunity.location = req.body.location || opportunity.location;
	  					opportunity.causesArea = req.body.causesArea || opportunity.causesArea;
	  					opportunity.description = req.body.description || opportunity.description;
	  					opportunity.requiredSkills = req.body.requiredSkills || opportunity.requiredSkills;
	  					opportunity.poster = req.body.poster || opportunity.poster;
	  					opportunity.save()
	  					.exec(function (error, saved) {
	  						if (error) {
	  							helpers.errorHandler(error, req, res);
	  						} else {
	  							res.status(201).send('\n Updated!');
	  						}
	  					})
					} else {
						helpers.errorHandler('Not Authorized To Modify Others');
					}
				} else {
					helpers.errorHandler('Opportunity Not Found');
				}
			})
		}
  	},

  	getCurrOpenings: function (req,res) {
  		// This should be tested
  		var open=[];
  		var id = req.params.id;
  		var token = req.headers['x-access-token'];
  		if (!token) {
  			helpers.errorHandler('No Token', req, res);
  		} else {
  			Opportunity.findOne({_id : id})
  			.then(function (error, opportunity) {
  				if (error) {
  					helpers.errorHandler(error, req, res);
  				} else if(opportunity){
  					return opportunity.currOpenings;
  				}else{
  					helpers.errorHandler('Opportunity Not Found');
  				}
  			})
  			.then(function (current) {
  				for (var i = 0; i < current.length; i++) {
  					Opening.find({_id : current[i]})
  					.then(function (error, opening) {
  						if (error) {
  							helpers.errorHandler(error, req, res);
  						} else if(opening){
  							open.push(opening);
  						}
  					})
  				}
  				res.status(200).send(open)
  			})
  		}
	},

	getClosedOpenings: function (req,res) {
		//TODO: return an array of closed openings
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
		//TODO: decide if the org can delete past opportunities
	}
}