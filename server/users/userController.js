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
						res.json({token : token, userId: user._id});
					}else{
						helpers.errorHandler('Incorrect Password');
					}
				});
			}else {
				helpers.errorHandler('User does not exist', req, res);
			}
		});
	},

	signup : function (req, res) {
		var username = req.body.username;
		var password = req.body.password;
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var email = req.body.email;
		var dateOfBirth = req.body.dateOfBirth;
		var gender = req.body.gender;
		var phoneNumber = req.body.phoneNumber;
		var skills = req.body.skills;
		var causes = req.body.causes;
		var picture = req.body.picture;

		User.findOne({ username : username})
		.exec(function(error, user){
			if (error) {
				helpers.errorHandler(error, req,res);
			}else if (user) {
				helpers.errorHandler('Account Already exists');
			}else{
				var newUser = new User({
					username : username,
					password: password,
					firstName : firstName,
					lastName : lastName,
					email : email,
					dateOfBirth : dateOfBirth,
					gender : gender,
					phoneNumber : phoneNumber,
					skills : [skills],
					causes : [causes],
					picture : picture
				});
				newUser.save(function (error, newUser) {
					if (error) {
						helpers.errorHandler(error, req, res);
					} else{
						res.status(201).send('User Created');
					}
				});
			}
		});
	},

	checkAuth : function (req, res, next) {
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
					helpers.errorHandler('User Not Found');
				}
			})
		}
	},

	getUser : function (req, res){
		User.findOne({ username: req.params.username}, function(error, user){
			if (error) {
				helpers.errorHandler(error, req, res);
			}else{
				res.status(200).send(user);
			}
		});
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

	// a function that allows for the user to edit their basic infor
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
								user.save(function(err, savedUser){
									res.status(201).send('Updated \n' + savedUser);
								});
						});
					}

				user.save(function (error, savedUser){
					if (error) {
						helpers.errorHandler(error, req, res);
					}else{
						res.status(201).send(JSON.stringify(savedUser));
					}
				});
			}else{
				helpers.errorHandler('User not Found', req, res);
			}
		});
	},

	requestNewPass : function (req, res){
		// to work on later
	}
};
