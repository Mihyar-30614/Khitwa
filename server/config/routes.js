var helpers = require('./helpers.js');
var userController = require('../users/userController.js');
var organizationController = require('../organizations/organizationController.js');

module.exports = function(app, express){
	
	// User routes goes here
	app.post('/api/users/signin', userController.signin);
	app.post('/api/users/signup', userController.signup);
	app.get('/api/users/getall', userController.getAll);
	app.get('/api/users/x/:username', userController.getUser);
	app.get('/api/users/signedin', userController.checkAuth);
	app.post('/api/user/edit/:username', userController.editUser);

	// Organization routes goes here
	app.post('/api/organization/signup', organizationController.createOrganization);
	app.get('/api/organization/x/:id', organizationController.getOne);
	app.get('/api/organization/all', organizationController.getAll);
	app.post('/api/organization/edit/:id', organizationController.editProfile);

};