process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var token =  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OGNhZTJlNzMwZmY1YTFjYTBmMTBmNDYiLCJzYWx0IjoiJDJhJDEwJGxyMkM4VFZNMkkuTFltd0NMa05XWGUiLCJ1c2VybmFtZSI6ImtoaXR3YW9yZyIsInBhc3N3b3JkIjoiJDJhJDEwJGxyMkM4VFZNMkkuTFltd0NMa05XWGVPLkpjWTNkdjNCcGxRUEt3STFwT1ZVYTBkenpkLmJ1IiwiZW1haWwiOiJraGl0d2FAa2hpdHdhLm9yZyIsIm1pc3Npb25TdGF0ZW1lbnQiOiJBIHN0ZXAgaW4gdGhlIHJpZ2h0IGRpcmVjdGlvbiIsImNvbnRhY3RJbmZvIjoiU29tZSBJbmZvIGFib3V0IHRoZSBvcmdhbml6YXRpb24iLCJfX3YiOjAsInJlc2V0YWJsZSI6ZmFsc2UsImFjdGl2ZSI6dHJ1ZSwicGFzdE9wcG9ydHVuaXRpZXMiOltdLCJjdXJyZW50T3Bwb3J0dW5pdGllcyI6W10sInJhdGUiOjAsInJhdGVycyI6W10sImxvY2F0aW9ucyI6WyJDYW5hZGEiXSwiY2F1c2VzX2FyZWEiOltdfQ.OuhPydHXueLxSuXMDIkkeXpOzuXXo5k95ARCyxri38E';
var Organization = require('../../server/organizations/organizationModel');
var Opportunity = require('../../server/opportunities/opportunityModel');
var opportunityController = require('../../server/opportunities/opportunityController');
var Opening = require('../../server/openings/openingModel');

describe('Opportunity Test DataBase', function (done) {
	
	Organization.collection.drop();
	Opportunity.collection.drop();
	Opening.collection.drop();

	beforeEach(function (done) {
		var newOrg = new Organization({
			'username':'khitwaorg',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'email':'Khitwa@khitwa.org'
		})
		newOrg.save(function (error, orgsaved) {
			var newOpp = new Opportunity({
				"title":"AHR",
				"_organizer":orgsaved.username,
				"startDate":"25-NOV-2016",
				"endDate":"26-NOV-2016",
				"location":"Halifax",
				"causesArea":"Education",
				"description":"Education changes the world!"
			})
			newOpp.save(function (error, saved) {
				newOrg.currentOpportunities.push(saved._id);
				newOrg.save(function (error, saved2) {
					done();
				})
			});
		});
	});

	afterEach(function (done) {
		Organization.collection.drop();
		Opportunity.collection.drop();
		Opening.collection.drop();
		done();
	});

	describe('All Opportunities', function (done) {
		
		it('Should have a method called allOpportunities', function (done) {
			expect(typeof opportunityController.allOpportunities).to.be.equal('function');
			done();
		});

		it('Should return an array of organization', function (done) {
			chai.request(server)
				.get('/api/opportunity/getall')
				.end(function (error, res) {
					expect(Array.isArray(res.body)).to.be.equal(true);
					expect(res.body.length).to.be.equal(1);
					expect(res.body[0].title).to.be.equal('AHR');
					done();
				});
		});
	});

	describe('Add Opportunity', function (done) {
		
		it('Should have a method called addOpportunity', function (done) {
			expect(typeof opportunityController.addOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In if not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/add')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should create Opportunity', function (done) {
			chai.request(server)
				.post('/api/opportunity/add')
				.set('x-access-token', token)
				.send({
					"password":"1234",
					"title":"AHR2",
					"startDate":"25-NOV-2016",
					"endDate":"26-NOV-2016",
					"location":"Halifax",
					"causesArea":"Education",
					"description":"Education changes the world!"
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Opportunity Created');
					done();
				});
		});
	});

	describe('Edit Opportunity', function (done) {
		
		it('Should have a method called editOpportunity', function (done) {
			expect(typeof opportunityController.editOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In if not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/edit/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
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
				.get('/api/opportunity/getall')
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

		it('Should return 500 ERROR Please Sign In when not signed in', function (done) {
			chai.request(server)
				.get('/api/opportunity/currentopenings/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
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

		it('Should return Current Opened Openings', function (done) {
			chai.request(server)
				.get('/api/opportunity/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/add/'+id)
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
							chai.request(server)
								.post('/api/opening/add/'+id)
								.set('x-access-token',token)
								.send({
									"title":"First Closed Opening",
									"numberOfVolunteers":12,
									"location":"Jordan",
									"description":"This is the first opening in this website",
									"skillsRequired":"English",
									"resources":"buses",
									"status":"Closed"
								})
								.end(function (error, res) {
									chai.request(server)
										.get('/api/opportunity/currentopenings/'+id)
										.set('x-access-token', token)
										.end(function (error, res) {
											expect(res.status).to.be.equal(200);
											expect(res.body[0].title).to.be.equal('First Opening');
											expect(res.body[0].status).to.be.equal('Active')
											expect(res.body.length).to.be.equal(1)
											done();
										})
								});
						});
				})
		})
	});

	describe('Get Closed Openings', function (done) {
		
		it('Should have a method called getClosedOpenings', function (done) {
			expect(typeof opportunityController.getClosedOpenings).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.get('/api/opportunity/closedopenings/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
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

		it('Should return Current Opened Openings', function (done) {
			chai.request(server)
				.get('/api/opportunity/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/add/'+id)
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
							chai.request(server)
								.post('/api/opening/add/'+id)
								.set('x-access-token',token)
								.send({
									"title":"First Closed Opening",
									"numberOfVolunteers":12,
									"location":"Jordan",
									"description":"This is the first opening in this website",
									"skillsRequired":"English",
									"resources":"buses",
									"status":"Closed"
								})
								.end(function (error, res) {
									chai.request(server)
										.get('/api/opportunity/closedopenings/'+id)
										.set('x-access-token', token)
										.end(function (error, res) {
											expect(res.status).to.be.equal(200);
											expect(res.body[0].title).to.be.equal('First Closed Opening');
											expect(res.body[0].status).to.be.equal('Closed')
											expect(res.body.length).to.be.equal(1)
											done();
										})
								});
						});
				})
		})
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
				.get('/api/opportunity/getall')
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

	describe('Close Opportunity', function (done) {
		
		it('Should have a method called closeOpportunity', function (done) {
			expect(typeof opportunityController.closeOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In if not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/close/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect',function (done) {
			chai.request(server)
				.post('/api/opportunity/close/something')
				.set('x-access-token', token)
				.send({
					"password":"1234"
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should Close Opportunity', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/KhitwaOrg')
				.end(function (error, res) {
					var id = res.body.currentOpportunities[0];
					
					chai.request(server)
						.post('/api/opportunity/close/'+id)
						.set('x-access-token', token)
						.send({
							"password":"1234"
						})
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opportunity Closed');
							done();
						});
				});
		});
	});

	describe('Reopen Opportunity', function (done) {
		
		it('Should have a method called reopenOpportunity', function (done) {
			expect(typeof opportunityController.reopenOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/reopen/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opportunity/reopen/something')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should Reopen closed Opportunity', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/KhitwaOrg')
				.end(function (error, res) {
					var id = res.body.currentOpportunities[0];
					
					chai.request(server)
						.post('/api/opportunity/close/'+id)
						.set('x-access-token', token)
						.send({
							"password":"1234"
						})
						.end(function (error, res) {

							chai.request(server)
								.post('/api/opportunity/reopen/'+id)
								.set('x-access-token', token)
								.send({
									"password":"1234"
								})
								.end(function (error, res) {
									expect(res.status).to.be.equal(201);
									expect(res.text).to.be.equal('Opportunity Reopened');
									done();
								});
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
				.get('/api/opportunity/organization/somethingnotright')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should return Opportunity', function (done) {
			chai.request(server)
				.get('/api/opportunity/organization/khitwaorg')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body[0]._organizer).to.be.equal('khitwaorg');
					done();
				});
		});
	});

	describe('Delete Opportunity', function (done) {
		
		it('Should have a method called deleteOne', function (done) {
			expect(typeof opportunityController.deleteOne).to.be.equal('function');
			done();
		});

		it('Should return ERROR Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opportunity/delete/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Wrong ID when passed incorrect ID', function (done) {
			chai.request(server)
				.post('/api/opportunity/delete/somethingnotright')
				.set('x-access-token', token)
				.send({
					"password":"1234"
				})
				.end(function (error ,res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Wrong ID');
					done();
				});
		});

		it('Should delete it if it was in past opportunities', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/KhitwaOrg')
				.end(function (error, res) {
					var id = res.body.currentOpportunities[0];
					
					chai.request(server)
						.post('/api/opportunity/closeOpportunity/'+id)
						.set('x-access-token', token)
						.send({
							"password":"1234"
						})
						.end(function (error, res) {
					
							chai.request(server)
								.post('/api/opportunity/delete/'+id)
								.set('x-access-token', token)
								.send({
									"password":"1234"
								})
								.end(function (error, res) {
									expect(res.status).to.be.equal(201);
									expect(res.text).to.be.equal('Opportunity Deleted');
									done();
								});
						});
				});
		});

		it('Should delete an opportunity', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/KhitwaOrg')
				.end(function (error, res) {
					var id = res.body.currentOpportunities[0];
					chai.request(server)
						.post('/api/opportunity/delete/'+id)
						.set('x-access-token', token)
						.send({
							"password":"1234"
						})
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opportunity Deleted');
							done();
						});
				});
		});
	});
});