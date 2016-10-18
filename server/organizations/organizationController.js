var Organization = require('./organizationModel.js');
var Opportunity = require('../opportunities/opportunityModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');

module.exports = {

	createOrganization : function (req, res) {
		Organization.findOne({name: req.body.name})
		.exec( function (error, found){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else if (found) {
				helpers.errorHandler('Name Already Exists', req, res);
			}else {
				 var newOrg = Organization({
				 name : req.body.name,
				 causes_area : req.body.causes_area,
				 locations : req.body.locations,
				 missionStatement : req.body.missionStatement,
				 contactInfo : req.body.contactInfo,
				 rate : req.body.rate,
				 picture : req.body.picture,
				 currentOpportunities : req.body.currentOpportunities,
				 pastOpportunities : req.body.pastOpportunities
				});

				newOrg.save( function (error, saved){
					if (saved) {
						res.status(201).send(JSON.stringify(saved));
					}else{
						helpers.errorHandler(error, req, res);
					}
				});
			}
		});
	},

	getByName : function (req, res) {
		Organization.findOne({ name: req.params.name})
		.exec(function (error, organization) {
			if (organization) {
				res.status(200).send(JSON.stringify(organization));
			}else{
				helpers.errorHandler('Organization Not Found', req, res);
			}
		});
	},

	getAll : function (req, res) {
		Organization.find({})
		.exec( function (error, organization){
			if (organization) {
				res.status(200).send(JSON.stringify(organization));
			}else if (error) {
				helpers.errorHandler(error, req, res);
			}else{
				helpers.errorHandler('Organization Not Found');
			}
		});
	},

	editProfile :  function (req, res) {
		Organization.findOne({ name: req.params.name})
		.exec( function (error, organization){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else if (!organization) {
				helpers.errorHandler('Organization Not Found');
			}else{

		        organization.causes_area = req.body.causes_area || organization.causes_area;
		        organization.locations = req.body.locations || organization.locations;
		        organization.missionStatement = req.body.missionStatement || organization.missionStatement;
		        organization.contactInfo = req.body.contactInfo || organization.contactInfo;
		        organization.rate = req.body.rate || organization.rate;
		        organization.picture = req.body.picture || organization.picture;
		        organization.currentOpportunities = req.body.currentOpportunities || organization.currentOpportunities;
		        organization.pastOpportunities = req.body.pastOpportunities || organization.pastOpportunities;
		        organization.owners = req.body.owners || organization.owners;

		        organization.save(function(error, saved){
		        	if (error) {
		        		helpers.errorHandler(error, req, res);
		        	}else {
		        		res.status(201).send(JSON.stringify(saved));
		        	}
		        });
			}
		});
	},

	deleteOrganization : function (req, res ) {
		Organization.findOne({ _id: req.params.id.toString()}).remove()
		.exec(function (error, organization){
			if(organization.result.n){
				res.status(201).send('Organization Deleted');
			}else{
				helpers.errorHandler(error, req, res);
			}
		});
	},

	addOpportunity : function (req, res) {
		var tempOpportunity = Opportunity({
	      title : req.body.title,
	      _organizer : req.params.id,
	      startDate : req.body.startDate,
	      endDate : req.body.endDate,
	      location : req.body.location,
	      causesArea : req.body.causesArea,
	      description : req.body.description,
	      skillsRequired: req.body.skillsRequired,
	      poster : req.body.poster
	      });

		tempOpportunity.save(function(error, created){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else {
				// res.status(201).send(created);
				Organization.update({ _id: req.params.id.toString()}, 
					{ $pull: { currentOpportunities : created._id } },
					function (error){
						if (error) {
							helpers.errorHandler(error, req, res);
						}
					});
				Organization.findOneAndUpdate({ _id: req.params.id.toString()},
					{$push: { currentOpportunities : created._id } },
					{new : true},
					function( error, saved){
						if (error) {
							helpers.errorHandler(error, req, res);
						} else {
							res.status(201).send(JSON.stringify(saved));
						}
				});
			}
		});
	},

	closeOpportunity : function (req, res) {
		Organization.update({ _id : req.params.id.toString()},
			{$pull: { currentOpportunities : req.body.opportunityId} },
			function (error){
				if (error) {
					helpers.errorHandler("Opportunity Not Found", req, res);
				}
		});
		Organization.update({ _id : req.params.id.toString()},
			{ $pull: { pastOpportunities : req.body.opportunityId } },
			function (error){
				if (error) {
					helpers.errorHandler(error, req, res);
				}
		});
		Organization.findOneAndUpdate({ _id: req.params.id.toString()},
			{$pull : { pastOpportunities: req.body.opportunityId } },
			{new : true},
			function (error, saved){
				if (error) {
					helpers.errorHandler(error, req, res);
				} else {
					res.status(201).send(JSON.stringify(saved));
				}
			});
		}
};