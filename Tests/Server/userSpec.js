process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var Organization = require('../../server/organizations/organizationModel');
var User = require('../../server/users/userModel');
var userController = require('../../server/users/userController');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OGNhOWMzMGM0NTcxZjI5ZDQ0OWViNWYiLCJzYWx0IjoiJDJhJDEwJC84SGlPeW9YN1VIYmNrMGFUUUExZy4iLCJ1c2VybmFtZSI6Im1paHlhciIsInBhc3N3b3JkIjoiJDJhJDEwJC84SGlPeW9YN1VIYmNrMGFUUUExZy5zUURGS3FOVHJnMUoxTE9vSGhHdVkvWE1xLlpqbmRPIiwiZmlyc3ROYW1lIjoiTWloeWFyIiwibGFzdE5hbWUiOiJBbG1hc2FsbWEiLCJlbWFpbCI6Im1paHlhckBraGl0d2Eub3JnIiwiZGF0ZU9mQmlydGgiOiIwOC1tYXItMTk4OSIsImdlbmRlciI6Ik1hbGUiLCJwaG9uZU51bWJlciI6IjIwNDQwNTU3MDciLCJfX3YiOjAsInJlc2V0YWJsZSI6ZmFsc2UsImFjdGl2ZSI6dHJ1ZSwicmF0ZSI6MCwiYXdhcmRzIjpbeyJvcmdhbml6YXRpb24iOiJLaGl0d2EiLCJfaWQiOiI1OGNhOWMzMGM0NTcxZjI5ZDQ0OWViNjAifV0sInNraWxscyI6WyJFbmdsaXNoIiwiQ29kaW5nIl19.xNjjVfsOCh4DmPB7oIIWxxpkh67Xykfukv_3O4V6quw';

describe('User Test Database', function (done) {
	
	User.collection.drop();
	Organization.collection.drop();

	beforeEach(function(done) {
		var newOrg = new Organization({
			'name':'KhitwaOrg',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'email':'Khitwa@khitwa.org'
		})
		newOrg.save();
		var newOrg2 = new Organization({
			'name':'Khitwa',
			'password':'1234',
			'cause_area':'volunteering',
			'locations':'Canada',
			'missionStatement':'A step in the right direction',
			'email':'Khitwa2@khitwa.org'
		})
		newOrg2.save();
		var newUser = new User ({
			'username':'mihyar',
			'password':'1234',
			'firstName':'Mihyar',
			'lastName':'Almasalma',
			'email':'mihyar@khitwa.org',
			'dateOfBirth':'08-mar-1989',
			'awards':[{"organization":"Khitwa"}],
			'active' : true
		})
		newUser.save(function (err, savedUSer) {
			done();
		});
	});

	afterEach(function (done) {
		User.collection.drop();
		Organization.collection.drop();
		done();
	});

	describe('Sign in User', function (done) {

		it('Should have a method called signin', function (done) {
			expect(typeof userController.signin).to.be.equal('function');
			done();
		});

		it('Should response 500 ERROR if user is not available', function (done) {
			chai.request(server)
				.post('/api/user/signin')
				.send({
					'username':'Stupied'
				})
				.end(function (error, res) {
					expect(error).to.not.equal(null);
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('User does not exist');
					done();
				});
		});

		it('Should give access token when signin', function (done) {
			chai.request(server)
				.post('/api/user/signin')
				.send({
					'username':'mihyar@khitwa.org',
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
				.post('/api/user/signin')
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

	describe('Signing up', function (done) {
		
		it('Should have a method called signup', function (done) {
			expect(typeof userController.signup).to.be.equal('function');
			done();
		});

		it('Should return 500 ERROR if username already exists', function (done) {
			chai.request(server)
				.post('/api/user/signup')
				.send({
					'username':'Mihyar',
					'password':'1234',
					'firstName':'Mihyar',
					'lastName':'Almasalma',
					'email':'mihyar2@khitwa.org',
					'dateOfBirth':'08-mar-1989'
				})
				.end(function (req, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Account Already exists');
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
				'dateOfBirth':'01-01-2001'
			})
			
			chai.request(server)
				.post('/api/user/signup')
				.send(extraUser)
				.end(function (err, res) {
					expect(err).to.be.equal(null);
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Please Check Your Email for Activation Link');
					done();
				});
		});

		it('Should response 500 ERROR if keys are not complete', function (done) {
			var extraUser = new User({
				'username':'newUser',
				'password':'newpassword'
			})
			chai.request(server)
				.post('/api/user/signup')
				.send(extraUser)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					done();
				});
		});
	});

	describe('Check Auth', function (done) {
		
		it('Should return 500 ERROR if there was Please Sign In when not signed in', function (done) {
			chai.request(server)
				.get('/api/user/signedin')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				})
		});

		it('Should return 200 if the user is logged in', function (done) {
			chai.request(server)
				.get('/api/user/signedin')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.text).to.be.equal('Authorized');
					done();
				})
		});
	});

	describe('Get User', function (done) {
		
		it('Should return 500 ERROR if user was not found', function (done) {
			chai.request(server)
				.get('/api/user/getUser/Someone')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('User Not Found');
					done();
				})
		});

		it('Should return 200 and User', function (done) {
			chai.request(server)
				.get('/api/user/getUser/Mihyar')
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

	describe('Get All Users', function (done) {
		
		it('Should have a method called getall', function (done) {
			expect(typeof userController.getAll).to.be.equal('function');
			done();
		});

		it('Should return 200 and Users', function (done) {
			chai.request(server)
				.get('/api/user/getall')
				.end(function (error, res) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.be.a('array');
					done();
				});
		});
	});

	describe('Edit User', function (done) {
		
		it('Should have a method called editUser', function (done) {
			expect(typeof userController.editUser).to.be.equal('function');
			done();
		});

		it('Should return 500 Please Sign In if the user was not signed in', function (done) {
			chai.request(server)
				.post('/api/user/edit')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should change password if oldPassword is passed in the body', function (done) {
			chai.request(server)
				.post('/api/user/edit')
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

		it('Should return 500 Wrong Password if oldPassword is incorrect', function (done) {
			chai.request(server)
				.post('/api/user/edit')
				.set('x-access-token',token)
				.send({
					'oldPassword':'12345',
					'password':'1234'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Wrong Password');
					done();
				});
		});

		it('Should modify the user info', function (done) {
			chai.request(server)
				.post('/api/user/edit')
				.set('x-access-token', token)
				.send({
					'lastName' : 'Al-Masalma'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.body.lastName).to.be.equal('Al-Masalma');
					done();
				});
		});
	});

	describe('Delete User', function (done) {

		it('Should have a method called deleteUser', function (done) {
			expect(typeof userController.deleteUser).to.be.equal('function');
			done();
		});

		it('Should return 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/user/delete')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should delete a user ', function (done) {
			chai.request(server)
				.post('/api/user/delete')
				.set('x-access-token',token)
				.send({
					"password":"1234"
				})
				.end(function (error,res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('User Deleted');
					done();
				});
		});
	});

	describe('Rate Organization', function (done) {
		
		it('Should have a method called rateOrganization', function (done) {
			expect(typeof userController.rateOrganization).to.be.equal('function');
			done();
		});

		it('Should return ERROR 500 Please Sign In when not signed in', function (done) {
			chai.request(server)
				.post('/api/user/rate/something')
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Please Sign In');
					done();
				});
		});

		it('Should return ERROR 500 Organization Not Found if ID is incorrect', function (done) {
			chai.request(server)
				.post('/api/user/rate/somethingWrong')
				.set('x-access-token',token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('Organization Not Found');
					done();
				});
		});

		it('Should return ERROR 500 You Have Not Worked With Them',function (done) {
			chai.request(server)
				.post('/api/user/rate/KhitwaOrg')
				.set('x-access-token', token)
				.end(function (error, res) {
					expect(res.status).to.be.equal(500);
					expect(res.text).to.be.equal('You Have Not Worked With Them');
					done();
				});
		});

		it('Should rate an organization', function (done) {
			chai.request(server)
				.post('/api/user/rate/Khitwa')
				.set('x-access-token',token)
				.send({
					'value': '4',
					'review' : 'Best Organization Ever'
				})
				.end(function (error, res) {
					expect(res.status).to.be.equal(201);
					expect(res.text).to.be.equal('Organization Rated');
					done();
				});
		});
	});
});