var helpers = require('./helpers.js');

module.exports = function(app, express){
	// User routes goes here
	app.post('/api/user/signin', userController.signin);
	app.post('/api/user/signup', userController.signup);
};