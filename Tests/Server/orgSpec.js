process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var expect = require ('chai').expect;
var path = require('path')
var server = require(path.join(__dirname,'../../' ,'./server/server.js'));
var chai = require('chai')
      ,chaiHttp = require('chai-http');
chai.use(chaiHttp);

var Organization = require('../../server/organizarions/organizarionModel');
var organizarionController = require('../../server/organizarions/organizarionController');

describe('Organization Test Database', function (done) {
	
	Organization.collection.drop();

	beforeEach(function (done) {
		var newOrg = new Organization({

		})
		newOrg.save(function (error,saved) {
			done();
		});
	});

	afterEach(function (done) {
		Organization.collection.drop();
		done();
	});
});