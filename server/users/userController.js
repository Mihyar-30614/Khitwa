var Organization = require('../organizations/organizationModel.js');
var User = require('./userModel.js');
var jwt = require('jsonwebtoken');
var helpers = require('../config/helpers.js');
var Q = require('q');
var crypto = require('crypto');
var secret = 'what lies beneath the sea';

module.exports = {

	signin: function (req, res) {

		var username = req.body.username.trim().toLowerCase();

		User.findOne({$or:[{username : username}, {email: username}]}).select('username email password active')
		.exec(function (error, user){
			if (user) {
				if (user.active) {				
					if (req.body.password) {
						var password = req.body.password.trim();
						User.comparePassword(password, user.password, res, function (found){
							if (found) {
								var token = jwt.sign({ username : user.username, email: user.email, _id : user._id}, secret , {expiresIn : '4h'});
								res.setHeader('x-access-token', token);
								res.json({token : token});
							}
						});
					} else {
						helpers.errorHandler('Password Not Provided', req, res);
					}
				} else {
					helpers.errorHandler('Please Activate Your Account', req, res);
				}
			}else {
				helpers.errorHandler('User does not exist', req, res);
			}
		});
	},

	signup : function (req, res) {

		var username = req.body.username === undefined? '' : req.body.username.trim();
		var email = req.body.email === undefined? '' : req.body.email.trim();
		var password = req.body.password === undefined? '' : req.body.password.trim();
		var firstName = req.body.firstName === undefined? '' : req.body.firstName.trim();
		var lastName = req.body.lastName === undefined? '' : req.body.lastName.trim();

		if (username == '' || password == '' || email == '' || firstName == '' || lastName == '') {
			helpers.errorHandler('Required Feild Missing', req, res);
		} else {
			var valid = helpers.validate(username, password, email);
			if (valid.valid) {			
				var user = new User();
				user.username = username;
				user.password = password;
				user.email = email;
				user.firstName = firstName;
				user.lastName = lastName;
				user.dateOfBirth = req.body.dateOfBirth;
				user.save(function (error, saved) {
					if (saved) {
						var encoded = jwt.sign({username : saved.username}, secret);
						var body = helpers.activateTemplate(saved.firstName, saved.lastName, encoded);
						helpers.email(saved.email, 'Account Activation', body, function () {
							res.status(201).send('Please Check Your Email for Activation Link');
						});
					} else {
						helpers.errorHandler('User Already Exsits', req, res);
					}
				})
			} else {
				helpers.errorHandler(valid.message, req, res);
			}
		}
	},

	checkAuth : function (req, res) {

	    var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		}else{
			var user = jwt.verify(token, secret);
			User.findOne({username : user.username})
			.exec(function (error, usr) {
				if(usr && usr.active){
					res.status(200).send('Authorized');
				}else{
					helpers.errorHandler('User Not Found', req, res);
				}
			})
		}
	},

	getUser : function (req, res){
		var username = req.params.username.toLowerCase();
		User.findOne({ username: username})
		.exec(function (error, user) {
			if (user) {
				res.status(200).send(user)
			}else{
				helpers.errorHandler('User Not Found', req, res);
			}
		})
	},

	getAll : function (req, res){

		User.find({}).select('username firstName lastName email dateOfBirth gender phoneNumber skills causes rate picture')
		.exec(function (error, users) {
			if (users) {
				res.status(200).send(users);
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
			var user = jwt.verify(token, secret);

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

	forgotPwd : function (req, res) {
		var email = req.body.email;
		User.findOne({email : email})
		.exec(function (error, user) {
			if (user) {
				crypto.randomBytes(20, function(err, buf) {
	        		var token = buf.toString('hex');
					var body = helpers.pwdResetTemplate(user.firstName, user.lastName, token);
					helpers.email(user.email, 'Password Reset', body, function () {
						user.pwdResetToken = token;
						user.pwdResetExpire = Date.now() + 36000000;
						user.save();
						res.status(200).send('Please Check Your Email For Reset Link');
					})
	    		});
			} else {
				helpers.errorHandler('User Not Found', req, res)
			}
		})
	},

	chckToken : function (req, res) {
		User.findOne({ pwdResetToken: req.params.token, pwdResetExpire: { $gt: Date.now() } })
		.exec(function (error, user) {
			if (user) {
				user.resetable = true;
				user.save(function (error, saved) {
					if(saved){
						res.redirect('/#/user/reset/'+req.params.token);
					}
				})
			} else {
				res.redirect('/#/reseterror');
			}
		})
	},

	pwdReset : function (req, res){
		var token = req.params.token;
		var password = req.body.password;

		if (!token) {
			helpers.errorHandler('Token Not Found', req, res)
		} else {
			User.findOne({pwdResetToken : token, resetable : true})
			.exec(function (error, user) {
				if (user) {					
					user.password = password;
					user.resetable = false;
					user.pwdResetToken = undefined;
					user.pwdResetExpire = undefined;
					user.save(function (error, saved) {
						if (saved) {
							res.status(201).send('Password Changed');
						}
					})
				} else {
					helpers.errorHandler('User Not Found', req, res);
				}
			})
		}
	},

	deleteUser : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var password = req.body.password;
		
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var user = jwt.verify(token, secret);
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
		var organization = req.params.id.toLowerCase();

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var user = jwt.verify( token, secret);
			User.findOne({ username : user.username})
			.exec(function (error, usr) {
				if (usr) {
					Organization.findOne({username : organization})
					.exec(function (error, org) {
						if (org) {
							var worked = usr.awards.map(function (award) {
								if (award.organization === org.username)
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

		var token = jwt.verify(req.params.token, secret) ;
		
		User.findOne({username : token.username})
		.exec(function (error,user) {
			if (user) {
				user.active = true;
				user.save(function (error, saved) {
					if(saved){
						res.redirect('/#/user/activate');
					}
				})
			} else {
				helpers.errorHandler('User Not Found', req, res);
			}
		})
	}
};
