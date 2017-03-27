process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var token =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtoaXR3YW9yZyIsImVtYWlsIjoia2hpdHdhQGtoaXR3YS5vcmciLCJfaWQiOiI1OGQ4ODg1YjIzZTE5ODNhNmMxMWFkN2IiLCJpYXQiOjE0OTA1ODU2OTIsImV4cCI6MTQ5MDYwMDA5Mn0.pBKdbzoiyiAd6S6wM9nDHamtiG40dqrUBk-JUcsJkOE';
var Organization = require('../../server/organizations/organizationModel');
var organizationController = require('../../server/organizations/organizationController');
var User = require('../../server/users/userModel');

describe('Organization Test Database', function (done) {
	
	Organization.collection.drop();
	User.collection.drop();

	beforeEach(function (done) {
		var newUser = new User ({
			'username':'mihyar',
			'password':'1234',
			'firstName':'Mihyar',
			'lastName':'Almasalma',
			'email':'mihyar@khitwa.org',
			'dateOfBirth':'08-mar-1989',
			'active' : true
		})
		newUser.save();
		var newOrg = new Organization({
			'username':'khitwaorg',
			'password':'1234',
			'email':'khitwa@khitwa.org',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'contactInfo':'Some Info about the organization',
			'active' : true
		})
		newOrg.save(function (error,saved) {
			done();
		});
	});

	afterEach(function (done) {
		Organization.collection.drop();
		User.collection.drop();
		done();
	});

	describe('Create Organization', function (done) {
		
		it('Should have a function called signup', function (done) {
			expect(typeof organizationController.signup).to.be.equal('function');
			done();
		});

		it('Should return 500 Required Feild Missing', function (done) {
			chai.request(server)
				.post('/api/organization/signup')
				.send({'username':'KhitwaOrg', 'email':'something@example.com'})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Required Feild Missing');
					done();
				});
		});

		it('Should register new organization', function (done) {
			chai.request(server)
				.post('/api/organization/signup')
				.send({
					'username':'newOrg',
					'password': 'newPassword',
					'email':'newOrganization@organization.org'
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
					'username':'Something',
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
					'username':'KhitwaOrg',
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
					'username':'KhitwaOrg',
					'password' : '1234'
				})
				.end(function (error, res) {
					expect(res.body.token).to.not.equal(undefined);
					done();
				});
		});
	});

	describe('Organization checkAuth', function (done) {

		it('Should have a method called checkAuth', function (done) {
			expect(typeof organizationController.checkAuth).to.be.equal('function');
			done();
		});

		it('Should return ERROR Please Sign In if not signed in', function (done) {
			 chai.request(server)
			 	.get('/api/organization/signedin')
			 	.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
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
					expect(res.body.username).to.be.equal('khitwaorg');
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
					expect(res.body[0].username).to.be.equal('khitwaorg');
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

		it('Should return 500 Please Sign In when not signedin', function (done) {
			chai.request(server)
				.post('/api/organization/edit')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
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
		
		it('Should return ERROR 500 Please Sign In when not signedin', function (done) {
			chai.request(server)
				.post('/api/organization/delete')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should delete organization', function (done) {
			chai.request(server)
				.post('/api/organization/delete')
				.set('x-access-token', token)
				.send({
					"password":"1234"
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Organization Deleted');
					done();
				});
		});
	});

	describe('Award Certificate', function (done) {
		
		it('Should have a method called awardCertificate',function (done) {
			expect(typeof organizationController.awardCertificate).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signedin', function (done) {
			chai.request(server)
				.post('/api/organization/award/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 User Not Found when ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/organization/award/Someone')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('User Not Found');
					done();
				});
		});

		it('Should Rate User', function (done) {
			chai.request(server)
				.post('/api/organization/award/Mihyar')
				.set('x-access-token', token)
				.send({
					'opportunity':'Something Cool',
					'opening':'Being Cool',
					'rate':'5',
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('User Rated');
					done();
				});
		});
	});
});