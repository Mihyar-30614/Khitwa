var Opportunity=require('../opportunities/opportunityModel.js');
var Opening=require('./openingModel.js');
var helpers = require('../config/helpers.js');
var Q = require('q');
var jwt = require('jwt-simple');
// var User = require('../users/userModel.js');

module.exports = {

	allOpenings : function (req, res) {
    Opening.find({})
    .exec(function (error, openings) {
      if (error) {
        helpers.errorHandler(error, req, res);
      } else if (openings) {
        res.status(200).send(openings);
      } else{
        helpers.errorHandler('No Openings', req, res);
      }
    })
	},
	
	closeOpening: function (req, res) {
    var token = req.headers['x-access-token'];
    var id = req.params.id.toString();
    var opportunitId;

    if (!token) {
      headers.errorHandler('No Token', req, res);
    } else {
      Opening.findOne({_id : id})
      .exec(function (error, opening) {
        if (error) {
          headers.errorHandler(error, req, res);
        } else if (opening) {
          opportunitId = opening._opportunity;
          opening.status = 'Closed';
          console.log('Opening Closed');

          Opportunity.findOne({_id : opportunitId})
          .exec(function (error, opportunity) {
            if (error) {
              headers.errorHandler(error, req, res);
            } else if (opportunity) {
              var index = opportunity.currOpenings.indexOf(id);
              opportunity.currOpenings.splice(index,1);
              opportunity.closedOpenings.push(id);
              opportunity.save(function (error, saved) {
                if (saved) {
                  res.status(201).send('Opening Closed');
                } else {
                  helpers.errorHandler(error, req, res);
                }
              })
            } else {
              headers.errorHandler('Opportunity Not Found', req, res);
            }
          })
        } else {
          helpers.errorHandler('No Opening Found', req, res);
        }
      })
    }
	},

	deleteOne : function(req, res){
	},

	editOpening : function (req, res) {
	},

  applyToOpening: function (req, res){
  },

  approveVolunteer: function (req, res){
  },

  rejectVolunteer: function (req, res){
  },
  
	getOpening: function (req, res) {
  }
}