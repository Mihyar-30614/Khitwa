process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

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
	})
});