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
				 password : req.body.password,
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
						res.status(201).send('Organization Created');
					}else{
						helpers.errorHandler(error, req, res);
					}
				});
			}
		});
	},

	signin : function (req, res) {

		var name =  req.body.name;
		var password = req.body.password;

		Organization.findOne({name : name})
		.exec(function (error, organization) {
			if (organization) {
				Organization.comparePassword(password, organization.password, res, function (found) {
					if (found) {
						var token = jwt.encode(organization,'secret');
						res.setHeader('x-access-token',token);
						res.json({ token : token, name : organization.name });
					} else {
						helpers.errorHandler('Wrong Password', req, res);
					}
				})
			} else if(error){
				helpers.errorHandler(error, req, res);
			}else{
				helpers.errorHandler('User Does Not Exists', req, res);
			}
		})
	},

	checkAuth : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		}else{
			var organization = jwt.decode(token,'secret');
			Organization.findOne({name : organization.name})
			.exec(function (error, org) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else if(org){
					res.status(200).send('Authorized');
				}else{
					helpers.errorHandler('Organization Not Found');
				}
			})
		}
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
		        if(req.body.oldPassword){
						Organization.comparePassword(req.body.oldPassword , organization.password , res , function(){
								organization.password = req.body.password;
								organization.save(function(savedOrg){
									res.status(201).send('Updated \n' + savedOrg);
								});
						});
					}

		        organization.save(function(saved){
		        	if (saved) {
		        		res.status(201).send(JSON.stringify(saved));
		        	}
		        });
			}
		});
	},

	deleteOrganization : function (req, res ) {

		Organization.findOne({ name: req.params.name}).remove()
		.exec(function (error, organization){
			if(organization.result.n){
				res.status(201).send('Organization Deleted');
			}else{
				helpers.errorHandler(error, req, res);
			}
		});
	},

	addOpportunity : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		}else{
			var organization = jwt.decode(token,'secret');
			var organizer = organization.name;
			var newOpp = new Opportunity({
				title : req.body.title,
				_organizer : organizer,
				startDate : req.body.startDate,
				endDate: req.body.endDate,
				location : req.body.location,
				causesArea : req.body.causesArea,
				description : req.body.description,
				skillsRequired : req.body.skillsRequired,
				poster : req.body.poster,
				currOpenings : req.body.currOpenings,
				closedOppenings : req.body.closedOppenings,
				status : req.body.status
			});

			newOpp.save(function (error, saved) {
				if (saved) {
					Organization.findOne({name : organizer})
					.exec(function (error, org) {
						if (error) {
							helpers.errorHandler(error, req, res);
						} else if(org){
							var id = saved._id;
							org.currentOpportunities.push(id);
							org.save(function (error, savedArray) {
								if (error) {
									helpers.errorHandler(error, req, res);
								} else {
									console.log(org.currentOpportunities)
								}
							})
						}else{
							helpers.errorHandler('Organization Not Found');
						}
					})
					res.status(201).send('Opportunity Created');
				} else {
					helpers.errorHandler(error, req, res);
				}
			});
		}
	},

	closeOpportunity : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		} else {
			var organization = jwt.decode(token, 'secret');
			var id = req.params.id;
			Opportunity.findOne({_id : id})
			.exec(function (error, found) {
				if (found) {
					found.status='Closed';
					found.save(function (error, saved) {
						if (error) {
							helpers.errorHandler(error, req, res);
						} else {
							console.log('Changed to Closed');
						}
					})
				} else if(error) {
					helpers.errorHandler(error, req, res);
				}else{
					helpers.errorHandler('Opportunity Not Found');
				}
			})
			Organization.findOne({name : organization.name})
			.exec(function (error, org) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else if (org) {
					var index = org.currentOpportunities.indexOf(id.toString());
					var toClose = org.currentOpportunities.splice(index,1);
					org.pastOpportunities.push(toClose);
					org.save(function (error, savedOrg) {
						if (savedOrg) {
							res.status(201).send('Opportunity Closed');
						} else {
							helpers.errorHandler(error, req, res);
						}
					})
				}else{
					helpers.errorHandler('Organization Not Found');
				}
			})
		}
	},
	reopenOpportunity : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var id = req. params.id.toString();

		if (!token) {
			headers.errorHandler('No Token', req, res);
		} else {
			Opportunity.findOne({_id : id})
			.exec(function (error, opportunity) {
				if (error) {
					headers.errorHandler(error, req, res);
				} else if (opportunity) {
					opportunity.status='Active';
					var org = opportunity._organizer;
					Organization.findOne({name : org})
					.exec(function (error, organization) {
						if (error) {
							headers.errorHandler(error, req, res);
						} else if (organization) {
							var index = organization.pastOpportunities.indexOf(id);
							organization.pastOpportunities.splice(index,1);
							organization.currentOpportunities.push(id);
							organization.save()
							.exec(function (error, saved) {
								if (error) {
									headers.errorHandler(error, req, res);
								} else {
									res.status(201).send('Opportunity Reopened');
								}
							})
						} else {
							helpers.errorHandler('Organization Not Found');
						}
					})
				} else {
					headers.errorHandler('Opportunity Not Found');
				}
			})
		}
	}
};