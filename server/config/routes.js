var helpers = require('./helpers.js');
var userController = require('../users/userController.js');

module.exports = function(app, express){
	// User routes goes here
	app.post('/api/user/signin', userController.signin);
	app.post('/api/user/signup', userController.signup);
	app.get('/api/user/getall', userController.getAll);
	app.get('/api/user/:username', userController.getUser)
};