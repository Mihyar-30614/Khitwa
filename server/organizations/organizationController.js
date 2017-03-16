var Organization = require('./organizationModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');
var crypto = require('crypto');

module.exports = {

	signup : function (req, res) {

		var username = req.body.username.toLowerCase();
		var email = req.body.email.toLowerCase();

		Organization.findOne({username: username})
		.exec( function (error, found){
			if (found) {
				helpers.errorHandler('Username Already Exists', req, res);
			}else {
				Organization.findOne({email:email})
				.exec(function (error, org) {
					if (org) {
						helpers.errorHandler('Email Already Used', req, res);
					} else {				
						var newOrg = Organization({
							username : username,
							password : req.body.password,
							email : email
						});

						newOrg.save( function (error, saved){
							if (saved) {
								var org = jwt.encode(saved, 'secret');
								var body = helpers.activateTemplate(saved.username, '', org, 'organization');
								helpers.email(saved.email, 'Account Activation', body, function () {
									res.status(201).send('Organization Created');
								})
							}
						});
					}
				})
			}
		});
	},

	signin : function (req, res) {

		var username =  req.body.username.toLowerCase();
		var password = req.body.password;

		Organization.findOne({username : username})
		.exec(function (error, organization) {
			if (organization) {
				if (organization.active) {	
					Organization.comparePassword(password, organization.password, res, function (found) {
						if (found) {
							var token = jwt.encode(organization,'secret');
							res.setHeader('x-access-token',token);
							res.json({ token : token, username : organization.username });
						}
					})
				} else {
					helpers.errorHandler('Please Activate Your Account', req, res);
				}
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
			Organization.findOne({username : organization.username})
			.exec(function (error, org) {
				if(org && org.active){
					res.status(200).send('Authorized');
				}else{
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	},

	getByName : function (req, res) {

		var username = req.params.username.toLowerCase();

		Organization.findOne({ username: username})
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

			Organization.findOne({ username: org.username})
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
			Organization.findOne({username : org.username})
			.exec(function (error, orga) {
				if (orga) {
					Organization.comparePassword(password, orga.password, res, function (found) {
						if (found) {
							Organization.findOne({ username: org.username}).remove()
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
		var username = req.params.id.toLowerCase();

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var organization = jwt.decode(token, 'secret');
			Organization.findOne({ username : organization.username })
			.exec(function (error, org) {
				if (org) {
					if (org.username === organization.username) {
						var award = {
							organization : org.username,
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
	},

	activate : function (req, res) {
		
		var token = jwt.decode(req.params.token, 'secret');

		Organization.findOne({username : token.username})
		.exec(function (error, organization) {
			if (organization) {
				organization.active = true;
				organization.save(function (error, saved) {
					if (saved) {
						res.status(201).send('Organization Acitvated');
					}
				})
			} else {
				helpers.errorHandler('Organization Not Found', req, res);
			}
		})
	}, 

	forgotPwd : function (req, res) {
		var email = req.body.email;
		Organization.findOne({email : email})
		.exec(function (error, organization) {
			if (organization) {
					crypto.randomBytes(20, function(err, buf) {
		        		var token = buf.toString('hex');
						var body = helpers.pwdResetTemplate(organization.username, '', token, 'organization');
						helpers.email('eng.mihyear@gmail.com', 'Password Reset', body, function () {
							organization.pwdResetToken = token;
							organization.pwdResetExpire = Date.now() + 36000000;
							organization.save();
							res.status(200).send('Please Check Your Email For Reset Link');
						})
					});
			} else {
				helpers.errorHandler('Organization Not Found', req, res);
			}
		})
	},

	chckToken : function (req, res) {
		Organization.findOne({pwdResetToken : req.params.token, pwdResetExpire: { $gt: Date.now() }})
		.exec(function (error, org) {
			if (org) {
				org.resetable = true;
				org.save(function (error, saved) {
					if (saved) {
						res.status(201).send('Token Still Alive');
					}
				})
			} else {
				helpers.errorHandler('Linked Expired', req, res)
			}
		})
	},

	pwdReset : function (req, res) {
		var token = req.params.token;
		var password = req.body.password;

		if (!token) {
			helpers.errorHandler('No Token', req, res);
		} else {
			Organization.findOne({pwdResetToken : token, resetable : true})
			.exec(function (error, org) {
				if (org) {
					org.password = password;
					org.pwdResetToken = undefined;
					org.pwdResetExpire = undefined;
					org.resetable = false;
					org.save(function (error, saved) {
						if (saved) {
							res.status(201).send('Password Changed');
						}
					})
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	}
};