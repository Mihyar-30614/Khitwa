var helpers = require('./helpers.js');
var userController = require('../users/userController.js');
var organizationController = require('../organizations/organizationController.js');
var opportunityController = require('../opportunities/opportunityController.js');
var openingController = require('../openings/openingController.js')

module.exports = function(app, express){
	
	// User routes goes here
	app.post('/api/users/signin', userController.signin);
	app.post('/api/users/signup', userController.signup);
	app.get('/api/users/getall', userController.getAll);
	app.get('/api/users/getUser/:username', userController.getUser);
	app.get('/api/users/signedin', userController.checkAuth);
	app.post('/api/user/edit', userController.editUser);
	app.post('/api/user/delete', userController.deleteUser);
	app.post('/api/user/rate/:id',userController.rateOrganization);

	// Organization routes goes here
	app.post('/api/organization/signup', organizationController.createOrganization);
	app.get('/api/organization/getByName/:name', organizationController.getByName);
	app.get('/api/organization/all', organizationController.getAll);
	app.post('/api/organization/edit', organizationController.editProfile);
	app.post('/api/organization/delete', organizationController.deleteOrganization);
	app.post('/api/organization/signin', organizationController.signin);
	app.get('/api/organization/signedin', organizationController.checkAuth);
	app.post('/api/organization/award/:id', organizationController.awardCertificate);

	// Opportunities routes goes here
	app.post('/api/opportunity/addOpportunity', opportunityController.addOpportunity);
	app.post('/api/opportunity/closeOpportunity/:id', opportunityController.closeOpportunity);
	app.post('/api/opportunity/reopenOpportunity/:id', opportunityController.reopenOpportunity);
	app.get('/api/opportunity/getall', opportunityController.allOpportunities);
	app.post('/api/opportunity/edit/:id',opportunityController.editOpportunity);
	app.get('/api/opportunity/currentopenings/:id', opportunityController.getCurrOpenings);
	app.get('/api/opportunity/closedopenings/:id', opportunityController.getClosedOpenings);
	app.get('/api/opportunity/get/:id', opportunityController.getOpportunity);
	app.get('/api/opportunity/organization/:name', opportunityController.getOpportunityByOrgId);
	app.post('/api/opportunity/delete/:id', opportunityController.deleteOne);

	// Openings routes goes here
	app.post('/api/opening/add/:id', openingController.addOpening);
	app.get('/api/opening/getall',openingController.allOpenings );
	app.post('/api/opening/close/:id', openingController.closeOpening);
	app.post('/api/opening/delete/:id',openingController.deleteOne);
	app.post('/api/opening/edit/:id', openingController.editOpening);
	app.post('/api/opening/apply/:id', openingController.applyToOpening);
	app.post('/api/opening/approve/:id', openingController.approveVolunteer);
	app.post('/api/opening/reject/:id', openingController.rejectVolunteer);
	app.get('/api/opening/getOne/:id', openingController.getOpening);
	app.post('/api/opening/reopen/:id',openingController.reopenOpening);
};