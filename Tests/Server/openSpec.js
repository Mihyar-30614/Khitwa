process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODgwM2MwYWEyOGVjYzFlMjBlYjMyZDgiLCJzYWx0IjoiJDJhJDEwJDlYbGVVOGRoN0F1YURVUTJpeW1XUC4iLCJuYW1lIjoiS2hpdHdhT3JnIiwicGFzc3dvcmQiOiIkMmEkMTAkOVhsZVU4ZGg3QXVhRFVRMml5bVdQLnh2eElHMjIxU0dvT1Q0aXVBbExTZkFCdVB4eU5xaGkiLCJtaXNzaW9uU3RhdGVtZW50IjoiQSBzdGVwIGluIHRoZSByaWdodCBkaXJlY3Rpb24iLCJjb250YWN0SW5mbyI6IktoaXR3YUBraGl0d2Eub3JnIiwiX192IjowLCJwYXN0T3Bwb3J0dW5pdGllcyI6W10sImN1cnJlbnRPcHBvcnR1bml0aWVzIjpbXSwibG9jYXRpb25zIjpbIkNhbmFkYSJdLCJjYXVzZXNfYXJlYSI6W119.A1L5jsFf-_PnhogaUYwQUlJFwHm0pmZr4uS4A2-_zxg';
var userToken ='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OGExZjRhYTg0MWFkZjEzNjQyMDBjNWMiLCJzYWx0IjoiJDJhJDEwJHpqUllFcVJiZGozUVhiUHRmUUEudy4iLCJ1c2VybmFtZSI6Ik1paHlhcjMiLCJwYXNzd29yZCI6IiQyYSQxMCR6alJZRXFSYmRqM1FYYlB0ZlFBLncuUktxL29PVTByeG9CYTJ2eWpvOXRyTmxCMnJRclFQdSIsImZpcnN0TmFtZSI6Ik1paHlhciIsImxhc3ROYW1lIjoiQWxtYXNhbG1hIiwiZW1haWwiOiJtaWh5YXJAa2hpdHdhLm9yZyIsImRhdGVPZkJpcnRoIjoiMDgtbWFyLTE5ODkiLCJnZW5kZXIiOiJNYWxlIiwicGhvbmVOdW1iZXIiOiIyMDQ0MDU1NzA3IiwiX192IjowLCJjYXVzZXMiOlsiTWVkaWNhbCJdLCJza2lsbHMiOlsiRW5nbGlzaCIsIkNvZGluZyJdfQ.3-EVxcLqJwbpiuuXnXrESnFYI05ItS2OERF36e-3kmY';
var User = require('../../server/users/userModel');
var Organization = require('../../server/organizations/organizationModel');
var Opportunity = require('../../server/opportunities/opportunityModel');
var Opening = require('../../server/openings/openingModel');
var openingController = require('../../server/openings/openingController');

describe('Openings DataBase', function (done) {
	
	Organization.collection.drop();
	Opportunity.collection.drop();
	Opening.collection.drop();

	beforeEach(function (done) {
		var newUser = new User({
			"username":"Mihyar3",
			"password":"1234",
			"firstName":"Mihyar",
			"lastName":"Almasalma",
			"email":"mihyar@khitwa.org",
			"dateOfBirth":"08-mar-1989",
			"gender":"Male",
			"phoneNumber":"2044055707",
			"skills":["English","Coding"]
		})
		newUser.save();
		var newOrg = new Organization({
			'name':'KhitwaOrg',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'contactInfo':'Khitwa@khitwa.org'
		})
		newOrg.save(function (error, orgsaved) {
			var newOpp = new Opportunity({
				"title":"AHR",
				"_organizer":orgsaved.name,
				"startDate":"25-NOV-2016",
				"endDate":"26-NOV-2016",
				"location":"Halifax",
				"causesArea":"Education",
				"description":"Education changes the world!"
			})
			newOpp.save(function (error, oppsaved) {
				newOpen = new Opening({
					"title":"First Opening",
					"_opportunity":oppsaved._id,
					"_organizer" : newOrg.name,
					"numberOfVolunteers":12,
					"location":"Jordan",
					"description":"This is the first opening in this website",
					"skillsRequired":"English",
					"resources":"buses",
					"status":"Active"
				})
				newOpen.save(function (error, saved) {
					newOpp.currOpenings.push(saved._id);
					newOpp.save(function (error, osaved) {
						done();
					});
				});
			});
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
				.post('/api/opening/add/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/add/somethingnotright')
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
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opening Added');
							done();
						});
				});
		});
	});

	describe('All Openings', function (done) {
		
		it('Should have a method called allOpenings',function (done) {
			expect(typeof openingController.allOpenings).to.be.equal('function');
			done();
		});

		it('Should return an array of openings', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(Array.isArray(res.body)).to.be.true;
					expect(res.body[0].title).to.be.equal('First Opening');
					done();
				});
		});

		it('Should return No Openings when there is no openings', function (done) {
			Opening.collection.drop();
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Openings');
					done();
				});
		});
	});

	describe('Close Opening', function (done) {
		
		it('Should have a method called closeOpening', function (done) {
			expect(typeof openingController.closeOpening).to.be.equal('function');
			done();
		});

		it('Should retrun ERROR 500 Please Sign In when not signed in',function (done) {
			chai.request(server)
				.post('/api/opening/close/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 No Opening Found when ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/close/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should close opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opening/close/'+id)
						.set('x-access-token', token)
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opening Closed');
							done();
						});
				});
		});
	});

	describe('Delete One', function (done) {
		
		it('Should have a method called deleteOne', function (done) {
			expect(typeof openingController.deleteOne).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/delete/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opening Not Found when ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/delete/somethingnotright')
				.set('x-access-token', token)
				.end(function (error,res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should delete when the opening is closed ', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opening/close/'+id)
						.set('x-access-token', token)
						.end(function (error, res) {									
							chai.request(server)
								.post('/api/opening/delete/'+id)
								.set('x-access-token', token)
								.end(function (error, res) {
									expect(res.status).to.be.equal(201);
									expect(res.text).to.be.equal('Opening Deleted');
									done();
								});
						});
				});
		});

		it('Should delete an opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.post('/api/opening/delete/'+id)
						.set('x-access-token', token)
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('Opening Deleted');
							done();
						});
				});
		});
	});

	describe('Edit Opening', function (done) {
		
		it('Should have a method called editOpening', function (done) {
			expect(typeof openingController.editOpening).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/edit/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR Opening Not Found when id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/edit/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should Edit Opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/edit/'+id)
						.set('x-access-token', token)
						.send({
							"numberOfVolunteers":10
						})
						.end(function (error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.body.numberOfVolunteers).to.be.equal(10);
							done();
						});
				});
		});
	});

	describe('Apply To Opening', function (done) {
		
		it('Should have a method called applyToOpening', function (done) {
			expect(typeof openingController.applyToOpening).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In if not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/apply/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opening Not Found when ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/apply/somethingnotright')
				.set('x-access-token', userToken)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should Apply to opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							expect(res.status).to.be.equal(201);
							expect(res.text).to.be.equal('User Applied');
							done();
						});
				});
		});

		it('Should cancel the application if called again', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							chai.request(server)
								.post('/api/opening/apply/'+id)
								.set('x-access-token', userToken)
								.end(function(error, res) {
									expect(res.status).to.be.equal(201);
									expect(res.text).to.be.equal('Application Cancelled');
									done();
								});
						});
				});
		});
	});

	describe('Approve Volunteer', function (done) {
		
		it('Should have a method called approveVolunteer', function (done) {
			expect(typeof openingController.approveVolunteer).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/approve/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should ERROR 500 Opening Not Found if ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/approve/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should approve an application', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							chai.request(server)
								.get('/api/opening/getall')
								.end(function (error, res) {
									var appName = res.body[0].pendingApps[0];

									chai.request(server)
										.post('/api/opening/approve/'+id)
										.set('x-access-token', token)
										.send({
											"appName" : appName
										})
										.end(function (error, res) {
											expect(res.status).to.be.equal(201);
											expect(res.text).to.be.equal('User Approved');
											done();
										});
								});
						});
				});
		});

		it('Should approve rejected application', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							chai.request(server)
								.get('/api/opening/getall')
								.end(function (error, res) {
									var appName = res.body[0].pendingApps[0];

									chai.request(server)
										.post('/api/opening/reject/'+id)
										.set('x-access-token', token)
										.send({
											"appName" : appName
										})
										.end(function (error, res) {
											chai.request(server)
												.post('/api/opening/approve/'+id)
												.set('x-access-token', token)
												.send({
													"appName" : appName
												})
												.end(function (error, res) {
													expect(res.status).to.be.equal(201);
													expect(res.text).to.be.equal('User Approved');
													done();
												});
										});
								});
						});
				});
		})
	});

	describe('Reject Volunteer', function (done) {
		
		it('Should have a method called rejectVolunteer', function (done) {
			expect(typeof openingController.rejectVolunteer).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/reject/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should ERROR 500 Opening Not Found if ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/reject/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should reject an application', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							chai.request(server)
								.get('/api/opening/getall')
								.end(function (error, res) {
									var appName = res.body[0].pendingApps[0];

									chai.request(server)
										.post('/api/opening/reject/'+id)
										.set('x-access-token', token)
										.send({
											"appName" : appName
										})
										.end(function (error, res) {
											expect(res.status).to.be.equal(201);
											expect(res.text).to.be.equal('User Rejected');
											done();
										});
								});
						});
				});
		});

		it('Should reject approved application', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/apply/'+id)
						.set('x-access-token', userToken)
						.end(function(error, res) {
							chai.request(server)
								.get('/api/opening/getall')
								.end(function (error, res) {
									var appName = res.body[0].pendingApps[0];

									chai.request(server)
										.post('/api/opening/approve/'+id)
										.set('x-access-token', token)
										.send({
											"appName" : appName
										})
										.end(function (error, res) {
											chai.request(server)
												.post('/api/opening/reject/'+id)
												.set('x-access-token', token)
												.send({
													"appName" : appName
												})
												.end(function (error, res) {
													expect(res.status).to.be.equal(201);
													expect(res.text).to.be.equal('User Rejected');
													done();
												});
										});
								});
						});
				});	
		})
	});

	describe('Get Opening', function (done) {
		
		it('Should have a method called getOpening', function (done) {
			expect(typeof openingController.getOpening).to.be.equal('function');
			done();
		});

		it('Should return an ERROR 500 Opening Not Found if id is incorrect', function (done) {
			chai.request(server)
				.get('/api/opening/getOne/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should return an opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;

					chai.request(server)
						.get('/api/opening/getOne/'+id)
						.end(function (error, res) {
							expect(res.status).to.be.equal(200);
							expect(res.body.title).to.be.equal('First Opening');
							done();
						});
				});
		});
	});

	describe('Reopen Opening', function (done) {
		
		it('Should have a method called reopenOpening', function (done) {
			expect(typeof openingController.reopenOpening).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In if not signed in', function (done) {
			chai.request(server)
				.post('/api/opening/reopen/something')
				.end(function (eror,res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Opening Not Found if id is incorrect', function (done) {
			chai.request(server)
				.post('/api/opening/reopen/somethingnotright')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opening Not Found');
					done();
				});
		});

		it('Should return ERROR 500 No Such Opening Closed if it is not closed', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/reopen/'+id)
						.set('x-access-token',token)
						.end(function (error, res) {
							expect(res.status).to.be.equal(500);
							expect(res.text).to.be.equal('No Such Opening Closed');
							done();
						});
				});
		});

		it('Should reopen opening', function (done) {
			chai.request(server)
				.get('/api/opening/getall')
				.end(function (error, res) {
					var id = res.body[0]._id;
					chai.request(server)
						.post('/api/opening/close/'+id)
						.set('x-access-token',token)
						.end(function (error, res) {
							chai.request(server)
								.post('/api/opening/reopen/'+id)
								.set('x-access-token', token)
								.end(function (error, res) {
									expect(res.status).to.be.equal(201);
									expect(res.text).to.be.equal('Opening Reopened');
									done();
								});
						});
				});
		});
	});
});