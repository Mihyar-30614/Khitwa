var Opportunity = require('./opportunityModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var helpers = require('../config/helpers.js');
var jwt = require('jwt-simple');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');

var createOpening = Q.nbind(Opening.create, Opening);
var findOpportunity = Q.nbind(Opportunity.findOne, Opportunity);
var findAllOpenings = Q.nbind(Opening.find, Opening);
var updateOrganization = Q.nbind(Organization.update, Organization);

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
  		if (!token){
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
				          res.status(200).send(allOpenings);
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
	editOpportunity : function (req,res,next) {
  		var opId = req.params.id;
  		var token = req.headers['x-access-token'];
  		if (!token){
  			next(new Error('No token'))
  		} else {
  			findOpportunity({_id:opId})
  			.then(function (opportunity) {
  				if(!opportunity) {
  					next(new Error('Opportunity does not exist'));
  				} else {
  					opportunity.title = req.body.title || opportunity.title;
  					opportunity.startDate = req.body.startDate || opportunity.startDate;
  					opportunity.endDate = req.body.endDate || opportunity.endDate;
  					opportunity.location = req.body.location || opportunity.location;
  					opportunity.causesArea = req.body.causesArea || opportunity.causesArea;
  					opportunity.description = req.body.description || opportunity.description;
  					opportunity.requiredSkills = req.body.requiredSkills || opportunity.requiredSkills;
  					opportunity.poster = req.body.poster || opportunity.poster;
  					opportunity.save();
  					res.json(opportunity);
  				}
  			})
  		}
  	},
  	getCurrOpenings: function (req,res,next) {
		var id = (req.params.id).toString();
		findOpportunity({'_id':id})
		.then(function(opportunity){
			return opportunity.currOpenings
		})
		.then(function(current){
			findAllOpenings({'_id': { $in: current}})
	        .then(function(cOpenings){
	          	res.json(cOpenings);
	        })
			.fail(function(err){
				res.send(204);
			})
		})
		.fail(function (err) {
	        next(err);
	 	})
	},
	getClosedOpenings: function (req,res,next) {
		var id = (req.params.id).toString();
		findOpportunity({'_id':id})
		.then(function(opportunity){
			return opportunity.closedOpenings
		})
		.then(function(closed){
			findAllOpenings({'_id': { $in: closed }})
	        .then(function(cOpenings){
	          	 res.json(cOpenings);
	        })
			.fail(function(err){
				res.send(204);
			})
		})
		.fail(function (err) {
	        next(err);
	 	})
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
	deleteOne : function(req,res, next){
	  	var id=(req.params.id).toString();
	  	var orgId;
	    findOpportunity({ _id : id})
	    .then(function(opportunity){
	    	orgId = opportunity._organizer;
	    	Opening.remove({_id:{$in: opportunity.currOpenings}}, function(err, removed){
	    		if(err){
	    			helpers.errorHandler("Couldn't remove current openings", req, res);
	    		} else {
	    			Opening.remove({_id:{$in: opportunity.closedOpenings}}, function(err, removed){
	    				if(err){
			    			helpers.errorHandler("Couldn't remove closed openings", req, res);
			    		} else {
			    			opportunity.remove(function(err,table) {
					        if(err){
					          helpers.errorHandler('Unable to delete organization', req, res);
					        } else {
					      		updateOrganization({ _id: orgId }, { $pull: { currentOpportunities: id } })
						    	.fail(function (err) {
						    		updateOrganization({ _id: orgId }, { $pull: { pastOpportunities: id } })
							    	.fail(function (err) {
							    		next(err)
							    	})
					  			})
		          				res.status(201).send('Opportunity Successfully Removed');
				        		}
				      		});
			    		}
	    			})
	    		}
	    	})
	    })
	    .fail(function(err){
			next(error);
	    })
	}
}