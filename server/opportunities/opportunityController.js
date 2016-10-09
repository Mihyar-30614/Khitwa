var Opportunity = require('./opportunityModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');

var createOpening = Q.nbind(Opening.create, Opening);
var findOpportunity = Q.nbind(Opportunity.findOne, Opportunity);
var findAllOpenings = Q.nbind(Opening.find, Opening);

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
	addOpening: function (req, res, next) {
  		var opportunityId = req.params.id.toString();
  		var token = req.headers['x-access-token'];
  		if (token){
  			next(new Error('No token'))
  		} else {
	  		var currOpening = {
	  			title: req.body.title,
	  			_opportunity: opportunityId,
	  			numberOfVolunteers: req.body.numberOfVolunteers,
	  			location: req.body.location,
	  			description: req.body.description,
	  			skillsRequired: req.body.skillsRequired,
	  			resources: req.body.resources,
	  			status: 'Active'
	  		}
	  		createOpening(currOpening)
		  	.then(function (newOpening) {
			    if (newOpening) {
			    	findOpportunity ( { "_id":opportunityId } )
			    	.then(function (opportunity) {
				    	if(!opportunity) {
		  					next(new Error('Opportunity does not exist'));
		  				} else {
		  					opportunity.currOpenings.push(newOpening._id)
		  					opportunity.save();
		  					return opportunity.currOpenings
		  				}
		  			})
		  			.then(function(openings) {
		  				findAllOpenings({'_id': { $in: openings}})
				        .then(function(allOpenings){
				          res.json(allOpenings);
				        })
		  			})
		  			.fail(function(err){
			        	next(err)
			      	})
			   	}})
		    .fail(function (error) {
		        next(error);
		 	})
		}
	},
}