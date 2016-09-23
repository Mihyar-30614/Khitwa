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
	}
}
