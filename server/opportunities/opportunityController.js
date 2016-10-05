var Opportunity = require('./opportunityModel.js');
var User = require('../users/userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');

module.exports = {
	
	allOpportunities : function (req, res) {
		Opportunity.find({})
		.exec(function(error, opportunities){
			if (error) {
				helpers.errorHandler(error, req, res);
			} else {
				res.status(200).send(opportunities)
			}
		});
	}
}