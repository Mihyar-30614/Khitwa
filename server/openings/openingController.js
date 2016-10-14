var Q = require('q');
var jwt = require('jwt-simple');
var Opportunity=require('../opportunities/opportunityModel.js');
var Opening=require('./openingModel.js');
var User = require('../users/userModel.js')

var findOneUser = Q.nbind(User.findOne, User);

var findOpportunity = Q.nbind(Opportunity.findOne, Opportunity);
var createOpportunity = Q.nbind(Opportunity.create, Opportunity);
var findAllOpportunities = Q.nbind(Opportunity.find, Opportunity);
var updateOpportunity = Q.nbind(Opportunity.update, Opportunity);
var updateOneOpportunity = Q.nbind(Opportunity.findOneAndUpdate, Opportunity);

var updateOneOpening = Q.nbind(Opening.findOneAndUpdate, Opening);
var findOpening = Q.nbind(Opening.findOne, Opening);
var createOpening = Q.nbind(Opening.create, Opening);
var findAllOpenings = Q.nbind(Opening.find, Opening);

module.exports = {

	allOpenings : function (req,res,next) {
	findAllOpenings({status:"Active"})
		.then(function (openings) {
			res.json(openings);
		})
		.fail(function (err) {
			next(err);
		})
	},
	
	closeOpening: function (req, res, next) {
  		var openingId = req.params.id.toString();
  		var token = req.headers['x-access-token'];
  		if (!token){
  			next(new Error('No token'))
  		} else {
  			findOpening({"_id":openingId})
		  	.then(function (opening) {
			    if (opening) {
			    	var opportunityId = opening._opportunity;
            opening.status = "Closed";
			    	opening.save();
			    	updateOpportunity({ _id: opportunityId }, { $pull: { currOpenings: openingId } })
			    	.fail(function (err) {
				    	next(err)
		  			})
		  			updateOneOpportunity({ _id: opportunityId}, { $push: { closedOpenings: openingId } },
      				{ new: true })
      				.then(function(opportunity){
						return opportunity.closedOpenings;
      				})
      				.then(function(closed){
      					findAllOpenings({'_id': { $in: closed}})
				        .then(function(allOpenings){
				          res.json(allOpenings);
				        })
      				})
      				.fail(function(err){
      					next(err);
      				})
			   	}})
		    .fail(function (error) {
		        next(error);
		 	})
		}
	},

	deleteOne : function(req,res, next){
    var id = (req.params.id).toString();
    findOpening({'_id':id})
    .then(function(opening){
      var opportunityId = opening._opportunity
      // updateOpportunity({ '_id': opportunityId }, { $pull: { currOpenings: openingId } })
      // updateOpportunity({ '_id': opportunityId }, { $pull: { closedOpenings: openingId } })

      opening.remove(function(err, removed){
        if(err){
            res.status(500).send('Unable to delete opening')
          } else {
            res.status(201).send('Opening Successfully Removed');
          }
      })
    })
	},

	editOpening : function (req,res,next) {
		var openingId = req.params.id.toString();
		var token = req.headers['x-access-token'];
		if (!token){
			next(new Error('No token'))
		} else {
			findOpening({_id:openingId})
			.then(function (opening) {
				if(!opening) {
					next(new Error('opening does not exist'));
				} else {
					opening.title = req.body.title || opening.title;
					opening.numberOfVolunteers = req.body.numberOfVolunteers || opening.numberOfVolunteers;
					opening.location = req.body.location || opening.location;
					opening.description = req.body.description || opening.description;
					opening.skillsRequired = req.body.skillsrequired || opening.skillsrequired;
					opening.resources = req.body.resources || opening.resources;
          opening.save();
					res.json(opening);
				}
			})
		}
	},

  applyToOpening: function (req,res,next){
    var openingId = req.params.id.toString();
    var token = req.headers['x-access-token'];
    if (!token){
      next(new Error('No token'))
    } else {
      var user = jwt.decode(token, 'secret');
      console.log(user)
      findOneUser( { _id: user._id } )
      .then( function( user ){
        if(!user){
          next(new Error('User does not exist'));
        } else {
          Opening.update({ _id: openingId },
                        { $pull: { pendingApps: user._id } },
                        function(err) {
                          if(err) 
                            console.log(err)
                        });
          Opening.findOneAndUpdate({ _id: openingId },
                                  { $push: { pendingApps: user._id } }, 
                                  { new : true}, 
                                  function (err , opening) {
                                    if(err)
                                      console.log(err);
                                    else{
                                      console.log('add it');
                                      res.json(opening);
                                    }
                                  });
        }
      })
    }
  },

  approveVolunteer: function (req,res,next){
    var openingId = req.params.id.toString();
    var applicantId = req.body.applicantId;
    var token = req.headers['x-access-token'];
    if (!token){
      next(new Error('No token'))
    } else {
      var user = jwt.decode(token, 'secret');
      findOneUser( { userName: user.username } )
      .then( function( user ){
        if(!user){
          next(new Error('User does not exist'));
        } else {
          Opening.update({ _id: openingId },
              { $pull: { pendingApps: applicantId } },
              function(err) {
                if(err) 
                  console.log(err)
              });
          Opening.update({ _id: openingId },
              { $pull: { volunteers: applicantId } },
              function(err) {
                if(err) 
                  console.log(err)
              });
          Opening.findOneAndUpdate({ _id: openingId },
                                  { $push: { volunteers: applicantId } }, 
                                  { new : true}, 
                                  function (err , opening) {
                                    if(err)
                                      console.log(err);
                                    else{
                                      console.log('add it');
                                      res.json(opening);
                                    }
                                  });
        }
      })
    }
  },

  rejectVolunteer: function (req,res,next){
    var openingId = req.params.id.toString();
    var applicantId = req.body.applicantId;
    var token = req.headers['x-access-token'];
    if (!token){
      next(new Error('No token'))
    } else {
      var user = jwt.decode(token, 'secret');
      findOneUser( { userName: user.username } )
      .then( function( user ){
        if(!user){
          next(new Error('User does not exist'));
        } else {
          Opening.update({ _id: openingId },
              { $pull: { pendingApps: applicantId } },
              function(err) {
                if(err) 
                  console.log(err)
              });
          Opening.update({ _id: openingId },
              { $pull: { volunteers: applicantId } },
              function(err) {
                if(err) 
                  console.log(err)
              });
          Opening.findOneAndUpdate({ _id: openingId },
                                  { $push: { rejectedApps: applicantId } }, 
                                  { new : true}, 
                                  function (err , opening) {
                                    if(err)
                                      console.log(err);
                                    else{
                                      console.log('add it');
                                      res.json(opening);
                                    }
                                  });
        }
      })
    }
  },
  
	getOpening: function (req,res,next) {
		var id=(req.params.id).toString();
		findOpening({_id: id}) 
		.then (function(opening) {
	  	res.status(200).send(opening);
		})
		.fail(function(error) {
			next(error);
		})
  }
}