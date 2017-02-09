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

describe('Organization Test Database', function (done) {
	
	Organization.collection.drop();

	beforeEach(function (done) {
		var newOrg = new Organization({
			'name':'KhitwaOrg',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'contactInfo':'Khitwa@khitwa.org'
		})
		newOrg.save(function (error,saved) {
			done();
		});
	});

	afterEach(function (done) {
		Organization.collection.drop();
		done();
	});

	describe('Create Organization', function (done) {
		
		it('Should have a function called createOrganization', function (done) {
			expect(typeof organizationController.createOrganization).to.be.equal('function');
			done();
		});

		it('Should return 500 Name Already Exists if the name is taken', function (done) {
			chai.request(server)
				.post('/api/organization/signup')
				.send({'name':'KhitwaOrg'})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Name Already Exists');
					done();
				});
		});

		it('Should register new organization', function (done) {
			chai.request(server)
				.post('/api/organization/signup')
				.send({
					'name':'newOrg',
					'password': 'newPassword'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Organization Created');
					done();
				});
		});
	});

	describe('Organization Signin',function (done) {
		
		it('Should have a method called signin', function (done) {
			expect(typeof organizationController.signin).to.be.equal('function');
			done();
		});

		it('Should return 500 User Does Not Exists when organization is not registered', function (done) {
			chai.request(server)
				.post('/api/organization/signin')
				.send({
					'name':'Something',
					'password':'Something'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('User Does Not Exists');
					done();
				});
		});

		it('Should return 500 Wrong Password when the password is wrong', function (done) {
			chai.request(server)
				.post('/api/organization/signin')
				.send({
					'name':'KhitwaOrg',
					'password':'password'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Wrong Password');
					done();
				});
		});

		it('Should give access token when signin',function (done) {
			chai.request(server)
				.post('/api/organization/signin')
				.send({
					'name':'KhitwaOrg',
					'password' : '1234'
				})
				.end(function (error, res) {
					expect(res.body.token).to.not.equal(undefined);
					expect(res.body.name).to.be.equal('KhitwaOrg');
					done();
				});
		});
	});

	describe('Organization checkAuth', function (done) {

		it('Should have a method called checkAuth', function (done) {
			expect(typeof organizationController.checkAuth).to.be.equal('function');
			done();
		});

		it('Should return ERROR No Token if not signed in', function (done) {
			 chai.request(server)
			 	.get('/api/organization/signedin')
			 	.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				})
		});

		it('Should return 200 if the organization is logged in', function (done) {
			chai.request(server)
				.get('/api/organization/signedin')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.text).to.be.equal('Authorized');
					done();
				});
		});
	});

	describe('Get Organization by Name', function (done) {
		
		it('Should have a method called getByName', function (done) {
			expect(typeof organizationController.getByName).to.be.equal('function');
			done();
		});

		it('Should return 500 Organization Not Found if the name is not registered', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/Something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Organization Not Found');
					done();
				});
		});

		it('Should return 200 Organization when passed registered organization', function (done) {
			chai.request(server)
				.get('/api/organization/getByName/KhitwaOrg')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body.name).to.be.equal('KhitwaOrg');
					done();
				});
		});
	});

	describe('Get All organizations', function (done) {
		
		it('Should have a method called getAll', function (done) {
			expect(typeof organizationController.getAll).to.be.equal('function');
			done();
		});

		it('Shoulde return Array of organizations', function (done) {
			chai.request(server)
				.get('/api/organization/all')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body[0].name).to.be.equal('KhitwaOrg');
					expect(Array.isArray(res.body)).to.be.equal(true);
					done();
				});
		});
	});

	describe('Edit Profile Organization', function (done) {
		
		it('Should have a method called editProfile', function (done) {
			expect(typeof organizationController.editProfile).to.be.equal('function');
			done();
		});

		it('Should return 500 No Token when not signedin', function (done) {
			chai.request(server)
				.post('/api/organization/edit')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should modify organization profile', function (done) {
			chai.request(server)
				.post('/api/organization/edit')
				.set('x-access-token', token)
				.send({
					'locations': ['Canada','Syria']
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(Array.isArray(res.body.locations)).to.be.equal(true);
					expect(res.body.locations[1]).to.be.equal('Syria');
					done();
				});
		});

		it('Should return ERROR 500 Wrong Password if the password entered is incorrect', function (done) {
			chai.request(server)
				.post('/api/organization/edit')
				.set('x-access-token', token)
				.send({
					'oldPassword':'12345',
					'password':'newPassword'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Wrong Password');
					done();
				});
		});

		it('Should return 201 Updated when passed oldPassword', function (done) {
			chai.request(server)
				.post('/api/organization/edit')
				.set('x-access-token', token)
				.send({
					'oldPassword':'1234',
					'password':'newPassword'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					done();
				});
		});
	});

	describe('Organization Delete', function (done) {

		it('Should have a method called deleteOrganization', function (done) {
			expect( typeof organizationController.deleteOrganization).to.be.equal('function');
			done();
		});
		
		it('Should return ERROR 500 No Token when not signedin', function (done) {
			chai.request(server)
				.post('/api/organization/delete')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should delete organization', function (done) {
			chai.request(server)
				.post('/api/organization/delete')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Organization Deleted');
					done();
				});
		});
	});

	describe('Organization Reopen Opportunity', function (done) {
		
		it('Should have a method called reopenOpportunity', function (done) {
			expect(typeof organizationController.reopenOpportunity).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 No Token when not signed in', function (done) {
			chai.request(server)
				.post('/api/organization/reopenOpportunity/581a85af49be4b14f4c45555')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return ERROR 500 Opportunity Not Found if the id is incorrect', function (done) {
			chai.request(server)
				.post('/api/organization/reopenOpportunity/581a85af49be4b14f4c45555')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Opportunity Not Found');
					done();
				});
		});

		it('Should Reopen closed Opportunity', function (done) {
			chai.request(server)
				.post('/api/opportunity/addOpportunity')
				.set('x-access-token', token)
				.send({
					"title":"AHR",
					"startDate":"25-NOV-2016",
					"endDate":"26-NOV-2016",
					"location":"Halifax",
					"causesArea":"Education",
					"description":"Education changes the world!"
				})
				.end(function (error, res) {
					chai.request(server)
						.get('/api/organization/getByName/KhitwaOrg')
						.end(function (error, res) {
							var id = res.body.currentOpportunities[0];
							
							chai.request(server)
								.post('/api/organization/closeOpportunity/'+id)
								.set('x-access-token', token)
								.end(function (error, res) {

									chai.request(server)
										.post('/api/organization/reopenOpportunity/'+id)
										.set('x-access-token', token)
										.end(function (error, res) {
											expect(res.status).to.be.equal(201);
											expect(res.text).to.be.equal('Opportunity Reopened');
											done();
										});
								});
						});
				});
		});
	});
});