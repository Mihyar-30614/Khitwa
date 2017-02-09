var Opportunity = require('../opportunities/opportunityModel.js');
var Organization = require('../organizations/organizationModel.js');
var Opening = require('./openingModel.js');
var User = require('../users/userModel.js');

var helpers = require('../config/helpers.js');
var Q = require('q');
var jwt = require('jwt-simple');

module.exports = {

  addOpening: function (req, res) {

    var token = req.headers['x-access-token'];
    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {

      var opportunityId = req.params.id.toString();
      var newOpening = new Opening({
        title : req.body.title,
        _opportunity : opportunityId,
        numberOfVolunteers : req.body.numberOfVolunteers,
        location : req.body.location,
        description : req.body.description,
        skillsRequired : req.body.skillsRequired,
        resources : req.body.resources,
        status : req.body.status
      })

      Opportunity.findOne({_id : opportunityId})
      .exec(function (error, opportunity) {
        if (opportunity) {
            newOpening.save(function (error, saved) {
            if (saved) {

              opportunity.currOpenings.push(saved._id);
              opportunity.save(function (error, oppSaved) {
                if (oppSaved) {
                  res.status(201).send('Opening Added');
                }
              })
            }
          })
        }else{
          helpers.errorHandler('Opportunity Not Found', req, res);
        }
      })
    }
  },

	allOpenings : function (req, res) {

    Opening.find({})
    .exec(function (error, openings) {
      if (openings.length>0) {
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
      helpers.errorHandler('No Token', req, res);
    } else {
      Opening.findOne({_id : id})
      .exec(function (error, opening) {
        if (opening) {
          opportunitId = opening._opportunity;
          opening.status = 'Closed';
          opening.save(function (error,saved) {
            if (saved) {
             console.log('Opening Closed');      
            }
          })

          Opportunity.findOne({_id : opportunitId})
          .exec(function (error, opportunity) {
            if (opportunity) {
              var index = opportunity.currOpenings.indexOf(id);
              opportunity.currOpenings.splice(index,1);
              opportunity.closedOpenings.push(id);
              opportunity.save(function (error,saved) {
                if (saved) {
                  res.status(201).send('Opening Closed');
                }
              })
            } else {
              helpers.errorHandler('Opportunity Not Found', req, res);
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
      Opening.findOne({ _id:id})
      .exec(function (error, opening) {
          if (opening) {
            var oppId = opening._opportunity;

      Opening.findOne({ _id : id}).remove()
          .exec(function (error, open) {
            if (open.result.n) {
              console.log(oppId);
              Opportunity.findOne({ _id : oppId})
              .exec(function (error, opportunity) {
                console.log(error)
                console.log(opportunity)
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

                  opportunity.save(function (error,saved) {
                    if (saved) {
                      res.status(201).send('Opening Deleted');
                    }
                  })
                } else {
                  helpers.errorHandler('Opportunity Not Found', req, res);
                }
              })
            }else{
              helpers.errorHandler('Opening Not Found', req, res);
            }
          })
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

          opening.save(function (error,saved) {
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
      var user = jwt.decode(token,'secret');
      User.findOne({username : user.username})
      .exec(function (error, user) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (user) {
          Opening.findOne({ _id : id})
          .exec(function (error, opening) {
            if (error) {
              helpers.errorHandler(error, req, res);
            } else if (opening) {
              if (opening.pendingApps.indexOf(user.username) === -1) {
                  opening.pendingApps.push(user.username);
                  opening.save(function (error, saved) {
                    if (saved) {
                      res.status(201).send('User Applied');
                    }
                  })
              } else {
                var index = opening.pendingApps.indexOf(user.username);
                opening.pendingApps.splice(index,1);
                opening.save(function (error, saved) {
                  res.status(201).send('Application Cancelled');
                })
              }
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

    var token = req.headers['x-access-token'];
    var openingId = req.params.id.toString();
    var applicantId = req.body.applicantId;

    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {
      var user = jwt.decode(token,'secret');
      Organization.findOne({ name : user.name})
      .exec(function (error, org) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (org) {
          Opening.findOne({ _id : openingId })
          .exec(function (error, opening) {
            if (error) {
              helpers.errorHandler(error, req, res);
            } else if (opening) {
              var index = opening.pendingApps.indexOf(applicantId);
              opening.pendingApps.splice(index,1);
              opening.volunteers.push(applicantId);
              opening.save(function (error, saved) {
                if (saved) {
                  res.status(201).send('User Approved');
                }
              })
            } else {
              helpers.errorHandler('Opening Not Found', req, res);
            }
          })
        } else {
          helpers.errorHandler('Not Authorized', req, res);
        }
      })
    }
  },

  rejectVolunteer: function (req, res){

    var token = req.headers['x-access-token'];
    var openingId = req.params.id.toString();
    var applicantId = req.body.applicantId;

    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {
      var user = jwt.decode(token,'secret');
      Organization.findOne({ name : user.name})
      .exec(function (error, org) {
        if (error) {
          helpers.errorHandler(error, req, res);
        } else if (org) {
          Opening.findOne({ _id : openingId })
          .exec(function (error, opening) {
            if (error) {
              helpers.errorHandler(error, req, res);
            } else if (opening) {
              var index = opening.pendingApps.indexOf(applicantId);
              if (index>0) {
                opening.pendingApps.splice(index,1);
                opening.rejectedApps.push(applicantId);
                opening.save(function (error, saved) {
                  if (saved) {
                    res.status(201).send('User Rejected');
                  }
                })
              } else {
                helpers.errorHandler('User Not Found', req, res);
              }
            } else {
              helpers.errorHandler('Opening Not Found', req, res);
            }
          })
        } else {
          helpers.errorHandler('Not Authorized', req, res);
        }
      })
    }
  },
  
	getOpening: function (req, res) {

    var id = req.params.id.toString();
    Opening.findOne({ _id : id })
    .exec(function (error, opening) {
      if (error) {
        helpers.errorHandler(error, req, res);
      } else if (opening) {
        res.status(200).send(opening);
      } else {
        helpers.errorHandler('Opening Not Found', req, res);
      }
    })
  }, 
  reopenOpening : function (req, res) {
    var token = req.headers['x-access-token'];
    var id = req.params.id.toString();

    if (!token) {
      helpers.errorHandler('No Token', req, res);
    } else {

      Opening.findOne({_id : id})
      .exec(function (error, opening) {
        if (opening) {
          var opportunityId = opening._opportunity;
          opening.status= 'Active';

          opening.save(function (error, saved) {
            if (saved) {
              console.log('Changed to Active');
            }
          })

          Opportunity.findOne({_id : opportunityId})
          .exec(function (error, opportunity) {
            if (opportunity) {
              if (opportunity.closedOpenings.indexOf(id)>0) {
                var index = opportunity.closedOpenings.indexOf(id);
                opportunity.closedOpenings.splice(index,1);
                opportunity.currOpenings.push(id);
              }else{
                helpers.errorHandler('No Such Opening Closed', req, res);
              }

              opportunity.save(function (error, saved) {
                if (saved) {
                  res.status(201).send('Opening reopened');
                }
              })
            } else {
              helpers.errorHandler('Opportunit Not Found', req, res);
            }
          })
        } else {
          helpers.errorHandler('Opening Not Found', req, res);
        }
      })
    }
  }
}