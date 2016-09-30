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
	    // checking to see if the user is authenticated
	    // grab the token in the header is any
	    // then decode the token, which we end up being the user object
	    // check to see if that user exists in the database
	    var token = req.headers['x-access-token'];
	    if (!token) {
	      next(new Error('No token'));
	    } else {
	      var user = jwt.decode(token, 'secret');
	      findUser({username: user.username})
	        .then(function (foundUser) {
	          if (foundUser) {
	            res.send(200);
	          } else {
	            res.send(401);
	          }
	        })
	        .fail(function (error) {
	          next(error);
	        });
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
		User.find({ username : req.params.username})
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
