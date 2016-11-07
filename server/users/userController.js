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
			if (error) {
				helpers.errorHandler(error,req, res);
			}else if (user) {
				User.comparePassword(password, user.password, res, function (found){
					if (found) {
						var token = jwt.encode(user, 'secret');
						res.setHeader('x-access-token', token);
						res.json({token : token, username: user.username});
					}else{
						helpers.errorHandler('Incorrect Password', req, res);
					}
				});
			}else {
				helpers.errorHandler('User does not exist', req, res);
			}
		});
	},

	signup : function (req, res) {

		var username = req.body.username;

		User.findOne({ username : username})
		.exec(function(error, user){
			if (error) {
				helpers.errorHandler(error, req,res);
			}else if (user) {
				helpers.errorHandler('Account Already exists', req, res);
			}else{
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
						res.status(201).send('User Created');
					}else{
						helpers.errorHandler(error, req, res);
					}
				});
			}
		});
	},

	checkAuth : function (req, res) {

	    var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('No Token', req, res);
		}else{
			var user = jwt.decode(token,'secret');
			User.findOne({name : user.name})
			.exec(function (error, org) {
				if (error) {
					helpers.errorHandler(error, req, res);
				} else if(org){
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

		User.find({}, function(error, users){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else{
				res.status(200).send(users);
			}
		});
	},

	// a function that allows for the user to edit their basic info
	editUser : function (req, res) {

		User.findOne({ username : req.params.username})
		.exec(function (error, user){
			if (error) {
				helpers.errorHandler(error, req, res);
			}else if (user) {
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
								user.save(function(error, savedUser){
									if (savedUser) {
									res.status(201).send('Updated \n' + savedUser);
									} else {
										helpers.errorHandler(error, req, res);
									}
								});
						});
					}

				user.save(function (error, savedUser){
					if (savedUser) {
						res.status(201).send(JSON.stringify(savedUser));
					}else{
						helpers.errorHandler(error, req, res);
					}
				});
			}else{
				helpers.errorHandler('User not Found', req, res);
			}
		});
	},

	requestNewPass : function (req, res){
		// to work on later
	},

	deleteUser : function (req, res) {
		
		var username= req.params.username;

		User.findOne({username: username}).remove()
		.exec(function (error, deleted) {
			if (deleted.result.n) {
				res.status(201).send('User Deleted');
			} else {
				helpers.errorHandler(error, req, res);
			}
		})
	}
};
