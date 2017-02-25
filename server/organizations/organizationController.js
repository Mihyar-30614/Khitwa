var Organization = require('./organizationModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');

module.exports = {

	createOrganization : function (req, res) {

		Organization.findOne({name: req.body.name})
		.exec( function (error, found){
			if (found) {
				helpers.errorHandler('Name Already Exists', req, res);
			}else {
				Organization.findOne({email:req.body.email})
				.exec(function (error, org) {
					if (org) {
						helpers.errorHandler('Email Already Used', req, res);
					} else {				
						var newOrg = Organization({
							name : req.body.name,
							password : req.body.password,
							causes_area : req.body.causes_area,
							locations : req.body.locations,
							missionStatement : req.body.missionStatement,
							email : req.body.email,
							contactInfo : req.body.contactInfo,
							rate : req.body.rate,
							picture : req.body.picture,
							currentOpportunities : req.body.currentOpportunities,
							pastOpportunities : req.body.pastOpportunities
						});

						newOrg.save( function (error, saved){
							if (saved) {
								res.status(201).send('Organization Created');
							}
						});
					}
				})
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
					}
				})
			}else{
				helpers.errorHandler('User Does Not Exists', req, res);
			}
		})
	},

	checkAuth : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		}else{
			var organization = jwt.decode(token,'secret');
			Organization.findOne({name : organization.name})
			.exec(function (error, org) {
				if(org){
					res.status(200).send('Authorized');
				}else{
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	},

	getByName : function (req, res) {

		Organization.findOne({ name: req.params.name})
		.exec(function (error, organization) {
			if (organization) {
				res.status(200).send(organization);
			}else{
				helpers.errorHandler('Organization Not Found', req, res);
			}
		});
	},

	getAll : function (req, res) {

		Organization.find({})
		.exec( function (error, organization){
			if (organization) {
				res.status(200).send(organization);
			}
		});
	},

	editProfile :  function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var org = jwt.decode(token,'secret');

			Organization.findOne({ name: org.name})
			.exec( function (error, organization){

		        organization.causes_area = req.body.causes_area || organization.causes_area;
		        organization.locations = req.body.locations || organization.locations;
		        organization.missionStatement = req.body.missionStatement || organization.missionStatement;
		        organization.contactInfo = req.body.contactInfo || organization.contactInfo;
		        organization.rate = req.body.rate || organization.rate;
		        organization.picture = req.body.picture || organization.picture;
		        if(req.body.oldPassword){
						Organization.comparePassword(req.body.oldPassword , organization.password , res , function(){
								organization.password = req.body.password;
								organization.save(function(savedOrg){
									res.status(201).send('Updated');
								});
						});
					}

		        organization.save(function(error,saved){
		        	if (saved) {
		        		res.status(201).send(saved);
		        	}
		        });
			});
		}
	},

	deleteOrganization : function (req, res ) {

		var token = req.headers['x-access-token'];
		var password = req.body.password;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			org = jwt.decode(token, 'secret');
			Organization.findOne({name : org.name})
			.exec(function (error, orga) {
				if (orga) {
					Organization.comparePassword(password, orga.password, res, function (found) {
						if (found) {
							Organization.findOne({ name: org.name}).remove()
							.exec(function (error, organization){
								if(organization.result.n){
									res.status(201).send('Organization Deleted');
								}else{
									helpers.errorHandler(error, req, res);
								}
							});
						}
					})
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	}, 

	awardCertificate : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var username = req.params.id;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var organization = jwt.decode(token, 'secret');
			Organization.findOne({ name : organization.name })
			.exec(function (error, org) {
				if (org) {
					if (org.name === organization.name) {
						var award = {
							organization : org.name,
							opporutnity : req.body.opporutnity,
							opening : req.body.opening,
							startDate : req.body.startDate,
							endDate : req.body.endDate,
							logo : org.logo,
							rate : req.body.rate,
							review : req.body.review
						};
						User.findOne({ username : username})
						.exec(function (error, user) {
							if (user) {
								user.awards.push(award);
								var score = user.awards.reduce(function (acc , val) {return acc + val.rate},0);
								user.rate = Math.round((score/user.awards.length)*10)/10;
								user.save(function (error, saved) {
									if (saved) {
										res.status(201).send('User Rated');
									}
								})
							} else {
								helpers.errorHandler('User Not Found',req, res);
							}
						})
					} else {
						helpers.errorHandler('Can Not Modify Others', req, res);
					}
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	}
};