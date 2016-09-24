var User = require('./userModel.js');
var jwt = require('jwt-simple');
var helpers = require('../config/helpers.js')

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
						res.json({token : token});
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

	checkAuth : function (req, res, next){

	},

	getUser : function (req, res, next){
		User.findOne({ username: req.params.username}, function(error, user){
			if (error) {
				helpers.errorHandler(error, req, res);
			}else{
				res.status(200).send(user);
			}
		});
	},

	getAll : function (req, res, next){
		User.find({}, function(error, users){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else{
				res.status(200).send(users);
			}
		});
	}
}
