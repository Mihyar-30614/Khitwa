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
// var Opening = require('../../server/openings/openingModel');
// var openingController = require('../../server/openings/openingController');

describe('Opportunity Test DataBase', function (done) {
	
	Organization.collection.drop();
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
			"_organizer":"KhitwaOrg",
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
		Opportunity.collection.drop();
		done();
	});

	describe('All Opportunities', function (done) {
		
		it('Should have a method called allOpportunities', function (done) {
			expect(typeof opportunityController.allOpportunities).to.be.equal('function');
			done();
		});

		it('Should return an array of organization', function (done) {
			chai.request(server)
				.get('/api/opportunities/getall')
				.end(function (error, res) {
					expect(Array.isArray(res.body)).to.be.equal(true);
					expect(res.body.length).to.be.equal(1);
					expect(res.body[0].title).to.be.equal('AHR');
					done();
				});
		});
	});

	describe('Add Opening', function (done) {

		it('Should have a method called addOpening', function (done) {
			expect(typeof opportunityController.addOpening).to.be.equal('function');
			done();
		});
		
		it('Should return ERROR 500 if you not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunities/addOpening/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opportunities/addOpening/somethingnotright')
				.set('x-access-token',token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should add new opening', function (done) {
			chai.request(server)
				.get('/api/opportunities/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opportunities/addOpening/'+id)
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

	describe('Edit Opportunity', function (done) {
		
		it('Should have a method called editOpportunity', function (done) {
			expect(typeof opportunityController.editOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 No Token if not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/edit/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id was incorrect', function (done) {
			chai.request(server)
				.post('/api/opportunity/edit/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should be able to modify an opportunity', function (done) {
			chai.request(server)
				.get('/api/opportunities/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opportunity/edit/'+id)
						.set('x-access-token', token)
						.send({
							'title':'test'
						})
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.body.title).to.be.equal('test');
							done();
						});
				});
		});
	});

	describe('Get Current Openings', function (done) {
		
		it('Should have a method called getCurrOpenings', function (done) {
			expect(typeof opportunityController.getCurrOpenings).to.be.equal('function');
			done();
		});

		it('Should return 500 ERROR No Token when not signed in', function (done) {
			chai.request(server)
				.get('/api/opportunity/currentopenings/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if id is incorrect', function (done) {
			chai.request(server)
				.get('/api/opportunity/currentopenings/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});
	});

	describe('Get Closed Openings', function (done) {
		
		it('Should have a method called getClosedOpenings', function (done) {
			expect(typeof opportunityController.getClosedOpenings).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 No Token when not signed in', function (done) {
			chai.request(server)
				.get('/api/opportunity/closedopenings/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.get('/api/opportunity/closedopenings/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});
	});

	describe('Get Opportunity', function (done) {
		
		it('Should have a method called getOpportunity', function (done) {
			expect(typeof opportunityController.getOpportunity).to.be.equal('function');
			done();
		});

		it('Should return 500 ERROR Opportunity Not Found if id is incorrect', function (done) {
			chai.request(server)
				.get('/api/opportunity/get/somethingnotright')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should return an opportunity', function (done) {
			chai.request(server)
				.get('/api/opportunities/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.get('/api/opportunity/get/'+id)
						.end(function (error, res) {
							expect(res.status).to.be.equal(200);
							expect(res.body.title).to.be.equal('AHR');
							done();
						});
				});
		});
	});

	describe('Get Opportunity By Organization ID', function (done) {
		
		it('Should have a method called getOpportunityByOrgId', function (done) {
			expect(typeof opportunityController.getOpportunityByOrgId).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Opportunity Not Found if id is incorrect', function (done) {
			chai.request(server)
				.get('/api/opportunities/organization/somethingnotright')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should return Opportunity', function (done) {
			chai.request(server)
				.get('/api/opportunities/organization/KhitwaOrg')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body[0]._organizer).to.be.equal('KhitwaOrg');
					done();
				});
		});
	});
});