var Organization = require('../organizations/organizationModel.js');
var User = require('./userModel.js');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js');
var Q = require('q');

module.exports = {

	signin: function (req, res) {

		var username = req.body.username;
		var password = req.body.password;

		User.findOne({username : username})
		.exec(function (error, user){
			if (user) {
				if (user.active) {				
					User.comparePassword(password, user.password, res, function (found){
						if (found) {
							var token = jwt.encode(user, 'secret');
							res.setHeader('x-access-token', token);
							res.json({token : token, username: user.username});
						}
					});
				} else {
					helpers.errorHandler('Please Activate Your Account', req, res);
				}
			}else {
				helpers.errorHandler('User does not exist', req, res);
			}
		});
	},

	signup : function (req, res) {

		var username = req.body.username;

		User.findOne({ username : username})
		.exec(function(error, user){
			if (user) {
				helpers.errorHandler('Account Already exists', req, res);
			}else{
				User.findOne({email:req.body.email})
				.exec(function (error, usr) {
					if (usr) {
						helpers.errorHandler('Email Already Used',req, res);
					} else {				
						var newUser = new User({
							username : req.body.username,
							password : req.body.password,
							firstName : req.body.firstName,
							lastName : req.body.lastName,
							email : req.body.email,
							dateOfBirth : req.body.dateOfBirth,
							gender : req.body.gender,
							phoneNumber : req.body.phoneNumber,
							skills : req.body.skills,
							causes : req.body.causes,
							picture : req.body.picture
						});
						newUser.save(function (error ,saved) {
							if (saved) {
								var user = jwt.encode(saved,'secret');
								var body = helpers.activateTemplate(saved.firstName, saved.lastName, user);
								helpers.email(saved.email, 'Account Activation', body, function () {
									res.status(201).send('User Created');
								});
							}else{
								helpers.errorHandler(error, req, res);
							}
						});
					}
				})
			}
		});
	},

	checkAuth : function (req, res) {

	    var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		}else{
			var user = jwt.decode(token,'secret');
			User.findOne({name : user.name})
			.exec(function (error, org) {
				if(org){
					res.status(200).send('Authorized');
				}else{
					helpers.errorHandler('User Not Found', req, res);
				}
			})
		}
	},

	getUser : function (req, res){

		User.findOne({ username: req.params.username})
		.exec(function (error, user) {
			if (user) {
				res.status(200).send(user)
			}else{
				helpers.errorHandler('User Not Found', req, res);
			}
		})
	},

	getAll : function (req, res){

		User.find({})
		.exec(function (error, users) {
			if (users) {
				var array = [];
				for (var i = 0; i < users.length; i++) {
					var obj={};
					obj.username = users[i].username;
					obj.firstName = users[i].firstName;
					obj.lastName = users[i].lastName;
					obj.email = users[i].email;
					obj.dateOfBirth = users[i].dateOfBirth;
					obj.gender = users[i].gender;
					obj.phoneNumber = users[i].phoneNumber;
					obj.skills = users[i].skills;
					obj.causes = users[i].causes;
					obj.rate = users[i].rate || 'N/A';
					obj.picture = users[i].picture || 'http://i.imgur.com/FlEXhZo.jpg?1';
					array.push(obj);
				}
				res.status(200).send(array);
			}else{
				helpers.errorHandler(error, req, res);
			}
		})
	},

	// a function that allows for the user to edit their basic info
	editUser : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		}else{
			var user = jwt.decode(token,'secret');

			User.findOne({ username : user.username})
			.exec(function (error, user){
				if (user) {
					user.firstName = req.body.firstName || user.firstName;
					user.lastName = req.body.lastName || user.lastName;
					user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
					user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
					user.skills = req.body.skills || user.skills;
					user.causes = req.body.causes || user.causes;
					user.picture = req.body.picture || user.picture;
					if(req.body.oldPassword){
							User.comparePassword(req.body.oldPassword , user.password , res , function(){
									user.password = req.body.password;
									user.save(function(error, saved){
										res.status(201).send('Updated');
									});
							});
						}

					user.save(function (error, savedUser){
						res.status(201).send(savedUser);
					});
				}else{
					helpers.errorHandler(error, req, res);
				}
			});
		}
	},

	requestNewPass : function (req, res){
		// to work on later
	},

	deleteUser : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var password = req.body.password;
		
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var user = jwt.decode(token,'secret');
			User.findOne({username: user.username})
			.exec(function (error, user) {
				User.comparePassword(password, user.password, res, function (found) {
					if (found) {
						User.findOne({username: user.username}).remove()
						.exec(function (error, deleted) {
							if(deleted.result.n){
								res.status(201).send('User Deleted');
							}else{
								helpers.errorHandler(error, req, res);
							}
						})
					}
				})
			})
		}
	}, 

	rateOrganization : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var organization = req.params.id;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var user = jwt.decode( token, 'secret');
			User.findOne({ username : user.username})
			.exec(function (error, usr) {
				if (usr) {
					Organization.findOne({name : organization})
					.exec(function (error, org) {
						if (org) {
							var worked = usr.awards.map(function (award) {
								if (award.organization === org.name)
									return true;
								return false;
							}).indexOf(true);
							if (worked > -1) {
								var x = {
									name : usr.username,
									value : req.body.value,
									review : req.body.review
								};
								org.raters.push(x);
								var score = org.raters.reduce(function (acc , val) {return acc + val.value},0);
								org.rate = Math.round((score/org.raters.length)*10)/10;
								org.save(function (error, saved) {
									if (saved) {
										res.status(201).send('Organization Rated');
									}
								})
							} else {
								helpers.errorHandler('You Have Not Worked With Them', req, res);
							}
						} else {
							helpers.errorHandler('Organization Not Found', req, res);
						}
					})
				} else {
					helpers.errorHandler('User Not Found', req, res);
				}
			})
		}
	},

	activate : function (req, res) {

		var token = jwt.decode(req.params.token, 'secret') ;
		
		User.findOne({username : token.username})
		.exec(function (error,user) {
			if (user) {
				user.active = true;
				user.save(function (error, saved) {
					if(saved){
						res.status(201).send('Account Activated');
					}
				})
			} else {
				helpers.errorHandler('User Not Found', req, res);
			}
		})
	}
};
