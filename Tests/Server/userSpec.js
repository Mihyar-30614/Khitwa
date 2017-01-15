process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var User = require('../../server/users/userModel');
var userController = require('../../server/users/userController');

describe('User Test Database', function (done) {
	
	User.collection.drop();

	beforeEach(function(done) {
		var newUser = new User ({
			'username':'Mihyar',
			'password':'1234',
			'firstName':'Mihyar',
			'lastName':'Almasalma',
			'email':'mihyar@khitwa.org',
			'dateOfBirth':'08-mar-1989',
			'gender':'Male',
			'phoneNumber':'2044055707',
			'skills':['English','Coding'],
			'causes':['Medical']
		})
		newUser.save(function (err, savedUSer) {
			done();
		});
	});

	afterEach(function (done) {
		User.collection.drop();
		done();
	});

	describe('Sign in User', function (done) {
		it('Should have a method called signin', function (done) {
			expect(typeof userController.signin).to.be.equal('function');
			done();
		});

		it('Should response 500 ERROR if user is not available', function (done) {
			chai.request(server)
				.post('/api/users/signin')
				.send({
					'username':'Stupied'
				})
				.end(function (error, res) {
					expect(error).to.not.equal(null);
					expect(res.status).to.be.equal(500);
					done();
				});
		});

		it('Should give access token when signin', function (done) {
			chai.request(server)
				.post('/api/users/signin')
				.send({
					'username':'Mihyar',
					'password':'1234'
				})
				.end(function (error, res) {
					expect(res.body.token).to.not.equal(undefined);
					expect(res.body).to.have.property('token');
					expect(res.body).to.have.property('username');
					done();
				});
		});

		it('Should return 500 ERROR if password is incorrect', function (done) {
			chai.request(server)
				.post('/api/users/signin')
				.send({
					'username':'Mihyar',
					'password':'wrongpassword'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					done();
				});
		});
	});

	describe('Signing up in User Controller', function (done) {
		
		it('Should have a method called signup', function (done) {
			expect(typeof userController.signup).to.be.equal('function');
			done();
		});

		it('Should return 500 ERROR if username already exists', function (done) {
			chai.request(server)
				.post('/api/users/signup')
				.send({
					'username':'Mihyar',
					'password':'1234',
					'firstName':'Mihyar',
					'lastName':'Almasalma',
					'email':'mihyar@khitwa.org',
					'dateOfBirth':'08-mar-1989',
					'gender':'Male',
					'phoneNumber':'2044055707',
					'skills':['English','Coding'],
					'causes':['Medical']
				})
				.end(function (req, res) {
					expect(res.status).to.be.equal(500);
					done();
				});
		});

		it('Should signup a new user', function (done) {
			var extraUser = new User({
				'username':'newUser',
				'password':'newpassword',
				'firstName':'newbie',
				'lastName':'user',
				'email':'newbie@khitwa.org',
				'dateOfBirth':'01-01-2001',
				'gender':'Male',
				'phoneNumber':'123456789'
			})
			
			chai.request(server)
				.post('/api/users/signup')
				.send(extraUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null);
					expect(res.status).to.be.equal(201);
					done();
				});
		});

		it('Should response 500 ERROR if keys are not complete', function (done) {
			var extraUser = new User({
				'username':'newUser',
				'password':'newpassword'
			})
			chai.request(server)
				.post('/api/users/signup')
				.send(extraUser)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					done();
				});
		});
	});

	describe('Check Auth in User Controller', function (done) {
		var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODIwMDVkMzlhZjNmYTE2MmMwN2M1NzUiLCJzYWx0IjoiJDJhJDEwJDNFOEhpN0IvVEV3YnVUd1lPdTJWQmUiLCJ1c2VybmFtZSI6Ik1paHlhciIsInBhc3N3b3JkIjoiJDJhJDEwJDNFOEhpN0IvVEV3YnVUd1lPdTJWQmVILjdvaWRNdC9pcXUwcVZXR0xpWFl2SXVMYlBOOHguIiwiZmlyc3ROYW1lIjoiTWloeWFyIiwibGFzdE5hbWUiOiJBbG1hc2FsbWEiLCJlbWFpbCI6Im1paHlhckBraGl0d2Eub3JnIiwiZGF0ZU9mQmlydGgiOiIwOC1tYXItMTk4OSIsImdlbmRlciI6Ik1hbGUiLCJwaG9uZU51bWJlciI6IjIwNDQwNTU3MDciLCJfX3YiOjAsImNhdXNlcyI6WyJNZWRpY2FsIl0sInNraWxscyI6WyJFbmdsaXNoIiwiQ29kaW5nIl19.Ya00dkg3PPPGFfbUEA30yh6X9Wcufm3d1--vNISfU2Y';
		
		it('Should return 500 ERROR if there was no token', function (done) {
			chai.request(server)
				.get('/api/users/signedin')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					done();
				})
		});

		it('Should return 200 if the user is logged in', function (done) {
			chai.request(server)
				.get('/api/users/signedin')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					done();
				})
		});
	});

	describe('Get User in User Controller', function (done) {
		
		it('Should return 500 ERROR if user was not found', function (done) {
			chai.request(server)
				.get('/api/users/getUser/Someone')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					done();
				})
		});

		it('Should return 200 and User', function (done) {
			chai.request(server)
				.get('/api/users/getUser/Mihyar')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.be.a('object');
					expect(res.body.firstName).to.be.equal('Mihyar');
					expect(res.body.lastName).to.be.equal('Almasalma');
					expect(res.body.email).to.be.equal('mihyar@khitwa.org');
					done();
				});
		});
	});

	describe('Get All Users in User Controller', function (done) {
		
		it('Should have a method called getall', function (done) {
			expect(typeof userController.getAll).to.be.equal('function');
			done();
		});

		it('Should return 200 and Users', function (done) {
			chai.request(server)
				.get('/api/users/getall')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.be.a('array');
					done();
				});
		});
	});

	describe('Edit User in User Controller', function (done) {
		var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODIwMDVkMzlhZjNmYTE2MmMwN2M1NzUiLCJzYWx0IjoiJDJhJDEwJDNFOEhpN0IvVEV3YnVUd1lPdTJWQmUiLCJ1c2VybmFtZSI6Ik1paHlhciIsInBhc3N3b3JkIjoiJDJhJDEwJDNFOEhpN0IvVEV3YnVUd1lPdTJWQmVILjdvaWRNdC9pcXUwcVZXR0xpWFl2SXVMYlBOOHguIiwiZmlyc3ROYW1lIjoiTWloeWFyIiwibGFzdE5hbWUiOiJBbG1hc2FsbWEiLCJlbWFpbCI6Im1paHlhckBraGl0d2Eub3JnIiwiZGF0ZU9mQmlydGgiOiIwOC1tYXItMTk4OSIsImdlbmRlciI6Ik1hbGUiLCJwaG9uZU51bWJlciI6IjIwNDQwNTU3MDciLCJfX3YiOjAsImNhdXNlcyI6WyJNZWRpY2FsIl0sInNraWxscyI6WyJFbmdsaXNoIiwiQ29kaW5nIl19.Ya00dkg3PPPGFfbUEA30yh6X9Wcufm3d1--vNISfU2Y';
		
		it('Should have a method called editUser', function (done) {
			expect(typeof userController.editUser).to.be.equal('function');
			done();
		});

		it('Should return 500 No Token if the user was not signed in', function (done) {
			chai.request(server)
				.post('/api/user/edit/Mihyar')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('No Token');
					done();
				});
		});

		it('Should return 500 ERROR if user not found', function (done) {
			chai.request(server)
				.post('/api/user/edit/someone')
				.set('x-access-token',token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('User not Found');
					done();
				});
		});

		it('Should change password if oldPassword is passed in the body', function (done) {
			chai.request(server)
				.post('/api/user/edit/Mihyar')
				.set('x-access-token',token)
				.send({
					'oldPassword': '1234',
					'password':'test'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					done();
				});
		});

	});

});