var Opportunity=require('../opportunities/opportunityModel.js');
var Opening=require('./openingModel.js');
var helpers = require('../config/helpers.js');
var Q = require('q');
var jwt = require('jwt-simple');
var User = require('../users/userModel.js');

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
          opening.save(function (saved) {
            if (saved) {
             console.log('Opening Closed');      
            }
          })

          Opportunity.findOne({_id : opportunitId})
          .exec(function (error, opportunity) {
            if (error) {
              headers.errorHandler(error, req, res);
            } else if (opportunity) {
              var index = opportunity.currOpenings.indexOf(id);
              opportunity.currOpenings.splice(index,1);
              opportunity.closedOpenings.push(id);
              opportunity.save(function (saved) {
                if (saved) {
                  res.status(201).send('Opening Closed');
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
    
    var token = req.headers['x-access-token'];
    var id = req.params.id.toString();

    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {

      Opening.findOne({ _id : id})
      .exec(function (error, opening) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (opening) {
          opening.remove()
          .exec(function (error, open) {
            if (open.result.n) {
              var oppId = opening._opportunity;
              Opportunity.findOne({ _id : oppId})
              .exec(function (error, opportunity) {
                if (error) {
                  helpers.errorHandler(error, req, res);
                } else if (opportunity) {
                  if(opportunity.currOpenings.indexOf(id)>0){
                    var index = opportunity.currOpenings.indexOf(id);
                    opportunity.currOpenings.splice(index,1);
                  }else{
                    var index = opportunity.closedOpenings.indexOf(id);
                    opportunity.closedOpenings.splice(index,1);
                  }

                  opportunity.save(function (saved) {
                    if (saved) {
                      res.status(201).send('Opening Deleted');
                    }
                  })
                } else {
                  helpers.errorHandler('Opportunity Not Found', req, res);
                }
              })
            }else{
              helpers.errorHandler('Opening Delete Failed', req, res);
            }
          })
        } else {
          helpers.errorHandler('Opening Not Found', req, res);
        }
      })
    }
	},

	editOpening : function (req, res) {

    var token = req.headers['x-access-token'];
    var id = req.params.id.toString();
    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {
      Opening.findOne({ _id : id })
      .exec(function (error, opening) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (opening) {
          opening.title = req.body.title || opening.title;
          opening.numberOfVolunteers = req.body.numberOfVolunteers || opening.numberOfVolunteers;
          opening.location = req.body.location || opening.location;
          opening.description = req.body.description || opening.description;
          opening.skillsRequired = req.body.skillsrequired || opening.skillsrequired;
          opening.resources = req.body.resources || opening.resources;

          opening.save(function (saved) {
            if (saved) {
              res.status(201).send('Opening Edited');
            }
          })
        } else {
          helpers.errorHandler('Opening Not Found', req, res);
        }
      })
    }
	},

  applyToOpening: function (req, res){

    var token = req.headers['x-access-token'];
    var id = req.params.id.toString();

    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {
      var user = jwt-decode(token,'secret');
      User.findOne({name : user.name})
      .exec(function (error, user) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (user) {
          Opening.findOne({ _id : id})
          .exec(function (error, opening) {
            if (error) {
              helpers.errorHandler(error, req, res);
            } else if (opening) {
              opening.pendingApps.push(user.name);
              opening.save(function (saved) {
                if (saved) {
                  res.status(201).send('User Applied');
                }
              })
            } else {
              helpers.errorHandler('Opening Not Found', req, res);
            }
          })
        } else {
          helpers.errorHandler('User Not Found', req, res);
        }
      })
    }
  },

  approveVolunteer: function (req, res){
  },

  rejectVolunteer: function (req, res){
  },
  
	getOpening: function (req, res) {
  }
}