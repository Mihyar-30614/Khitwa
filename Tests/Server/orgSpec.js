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
});