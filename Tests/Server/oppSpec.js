process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODgwM2MwYWEyOGVjYzFlMjBlYjMyZDgiLCJzYWx0IjoiJDJhJDEwJDlYbGVVOGRoN0F1YURVUTJpeW1XUC4iLCJuYW1lIjoiS2hpdHdhT3JnIiwicGFzc3dvcmQiOiIkMmEkMTAkOVhsZVU4ZGg3QXVhRFVRMml5bVdQLnh2eElHMjIxU0dvT1Q0aXVBbExTZkFCdVB4eU5xaGkiLCJtaXNzaW9uU3RhdGVtZW50IjoiQSBzdGVwIGluIHRoZSByaWdodCBkaXJlY3Rpb24iLCJjb250YWN0SW5mbyI6IktoaXR3YUBraGl0d2Eub3JnIiwiX192IjowLCJwYXN0T3Bwb3J0dW5pdGllcyI6W10sImN1cnJlbnRPcHBvcnR1bml0aWVzIjpbXSwibG9jYXRpb25zIjpbIkNhbmFkYSJdLCJjYXVzZXNfYXJlYSI6W119.A1L5jsFf-_PnhogaUYwQUlJFwHm0pmZr4uS4A2-_zxg';
var Organization = require('../../server/organizations/organizationModel');
var organizationController = require('../../server/organizations/organizationController');
var Opportunity = require('../../server/opportunities/opportunityModel');
var opportunityController = require('../../server/opportunities/opportunityController');

describe('Opportunity Test DataBase', function (done) {
	
	Opportunity.collection.drop();

	beforeEach(function (done) {
		var newOrg = new Organization({
			'name':'KhitwaOrg',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'contactInfo':'Khitwa@khitwa.org'
		})
		newOrg.save();
		var newOpp = new Opportunity({
			"title":"AHR",
			"startDate":"25-NOV-2016",
			"endDate":"26-NOV-2016",
			"location":"Halifax",
			"causesArea":"Education",
			"description":"Education changes the world!"
		})
		newOpp.save(function (error, saved) {
			done();
		})
	});

	afterEach(function (done) {
		Organization.collection.drop();
		done();
	});

	
})