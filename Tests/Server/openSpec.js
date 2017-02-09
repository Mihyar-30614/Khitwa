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
var Opening = require('../../server/openings/openingModel');
var openingController = require('../../server/openings/openingController');

describe('Openings DataBase', function (done) {
	
	Organization.collection.drop();
	Opportunity.collection.drop();
	Opening.collection.drop();

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
			"_organizer":"KhitwaOrg",
			"startDate":"25-NOV-2016",
			"endDate":"26-NOV-2016",
			"location":"Halifax",
			"causesArea":"Education",
			"description":"Education changes the world!"
		})
		newOpp.save();
		newOpen = new Opening({
			"title":"First Opening",
			"_opportunity":"AHR",
			"numberOfVolunteers":12,
			"location":"Jordan",
			"description":"This is the first opening in this website",
			"skillsRequired":"English",
			"resources":"buses",
			"status":"Active"
		})
		newOpen.save(function (error, saved) {
			done();
		});
	});

	afterEach(function (done) {
		Organization.collection.drop();
		Opportunity.collection.drop();
		Opening.collection.drop();
		done();
	});

	describe('Add Opening', function (done) {

		it('Should have a method called addOpening', function (done) {
			expect(typeof openingController.addOpening).to.be.equal('function');
			done();
		});
		
		it('Should return ERROR 500 if you not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/addOpening/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/addOpening/somethingnotright')
				.set('x-access-token',token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should add new opening', function (done) {
			chai.request(server)
				.get('/api/opportunity/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opening/addOpening/'+id)
						.set('x-access-token',token)
						.send({
							"title":"First Opening",
							"numberOfVolunteers":12,
							"location":"Jordan",
							"description":"This is the first opening in this website",
							"skillsRequired":"English",
							"resources":"buses",
							"status":"Active"
						})
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opening Added');
							done();
						});
				});
		});
	});

	xdescribe('All Openings', function (done) {
		
		it('Should have a method called allOpenings',function (done) {
			expect(typeof openingController.allOpenings).to.be.equal('function');
			done();
		});
	})
});