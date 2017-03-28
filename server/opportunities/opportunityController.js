var Opportunity = require('./opportunityModel.js');
var Opening = require('../openings/openingModel.js');
var Organization = require('../organizations/organizationModel.js');
var Q = require('q');
var helpers = require('../config/helpers.js');
var jwt = require('jsonwebtoken');
var secret = 'what lies beneath the sea';

module.exports = {
	
	allOpportunities : function (req, res) {
		
		Opportunity.find({})
		.exec(function(error, opportunities){
			if (opportunities) {
				res.status(200).send(opportunities)
			}else{
				helpers.errorHandler(error, res, req);
			}
		});
	},

	addOpportunity : function (req, res) {

		var token = req.headers['x-access-token'];
		var password = req.body.password;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		}else{
			var organization = jwt.verify(token,secret);
			var organizer = organization.username;

			Organization.findOne({username : organizer})
			.exec(function (error, org) {
				if (org) {
					Organization.comparePassword(password, org.password, res, function (found) {
						if(found){					
							var newOpp = new Opportunity({
								title : req.body.title,
								_organizer : organizer,
								startDate : req.body.startDate,
								endDate: req.body.endDate,
								location : req.body.location,
								causesArea : req.body.causesArea,
								description : req.body.description,
								skillsRequired : req.body.skillsRequired,
								poster : req.body.poster,
								currOpenings : req.body.currOpenings,
								closedOppenings : req.body.closedOppenings,
								status : req.body.status
							});
							newOpp.save(function (error, saved) {
								if (saved) {
									var id = saved._id;
									org.currentOpportunities.push(id);
									org.save(function (error, savedArray) {
										if (savedArray) {
											res.status(201).send('Opportunity Created');
										}
									});
								}
							});
						}
					})
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	},

	closeOpportunity : function (req, res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {

			var organization = jwt.verify(token, secret);
			var id = req.params.id;
			var password = req.body.password;

			Organization.findOne({username : organization.username})
			.exec(function (error, org) {
				if (org) {
					Organization.comparePassword(password, org.password, res, function (match) {
						if (match) {								
							Opportunity.findOne({_id : id})
							.exec(function (error, opp) {
								if (opp) {
									if (opp._organizer === organization.username) {
											opp.status = 'Closed';
											opp.save(function (error, saved) {
												if (saved) {								
													var index = org.currentOpportunities.indexOf(id);
													if (index > -1) {
														var toClose = org.currentOpportunities.splice(index,1);
														org.pastOpportunities.push(toClose);
														org.save(function (error, savedOrg) {
															if (savedOrg) {
																res.status(201).send('Opportunity Closed');
															}
														})
													} else {
														helpers.errorHandler('Opportunity Already Closed', req, res);
													}
												}
											});
									} else {
										helpers.errorHandler('Can Not Modify Others', req, res)
									}
								} else {
									helpers.errorHandler('Opportunity Not Found', req, res);
								}
							})
						}
					})
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	},

	reopenOpportunity : function (req, res) {
		
		var token = req.headers['x-access-token'];
		var id = req. params.id.toString();

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {

			var password = req.body.password;
			var org = jwt.verify(token,secret);

			Organization.findOne({username : org.username})
			.exec(function (error, organization) {
				if (organization) {
					Opportunity.findOne({_id : id})
					.exec(function (error, opportunity) {
						if (opportunity) {
							if (opportunity._organizer === org.username) {
								Organization.comparePassword(password, organization.password, res, function (match) {
									if (match) {
										opportunity.status = 'Active';
										opportunity.save(function (error, saved) {
											if (saved) {
												var index = organization.pastOpportunities.indexOf(id);
												if (index > -1) {
													organization.pastOpportunities.splice(index,1);
													organization.currentOpportunities.push(id);
													organization.save(function (error, oppSaved) {
														if (oppSaved) {
															res.status(201).send('Opportunity Reopened');
														}
													})
												} else {
													helpers.errorHandler('Opportunity Already Open', req, res);
												}
											}
										})
									}
								})
							} else {
								helpers.errorHandler('Can Not Modify Others', req, res);
							}
						} else {
							helpers.errorHandler('Opportunity Not Found', req, res);
						}
					})
				} else {
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	},

	editOpportunity : function (req,res) {

		var token = req.headers['x-access-token'];
		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
			var id = req.params.id.toString();
			Opportunity.findOne({_id : id})
			.exec(function (error, opportunity) {
				if (opportunity) {
					orgna = jwt.verify(token,secret);
					if (opportunity._organizer === orgna.username) {
						opportunity.title = req.body.title || opportunity.title;
	  					opportunity.startDate = req.body.startDate || opportunity.startDate;
	  					opportunity.endDate = req.body.endDate || opportunity.endDate;
	  					opportunity.location = req.body.location || opportunity.location;
	  					opportunity.causesArea = req.body.causesArea || opportunity.causesArea;
	  					opportunity.description = req.body.description || opportunity.description;
	  					opportunity.requiredSkills = req.body.requiredSkills || opportunity.requiredSkills;
	  					opportunity.poster = req.body.poster || opportunity.poster;
	  					opportunity.save(function (error, saved) {
	  						if (saved) {
	  							res.status(201).send(opportunity);
	  						}
	  					})
					} else {
						helpers.errorHandler('Not Authorized To Modify Others', req, res);
					}
				} else {
					helpers.errorHandler('Opportunity Not Found', req, res);
				}
			})
		}
  	},

  	getCurrOpenings: function (req,res) {
  		
  		var id = req.params.id;
  		var token = req.headers['x-access-token'];

  		if (!token) {
  			helpers.errorHandler('Please Sign In', req, res);
  		} else {
	  		Opening.find({_opportunity: id, status:'Active'})
	  		.exec(function (error, opportunity) {
	  			if (opportunity.length>0) {
	  				res.status(200).send(opportunity);
	  			} else {
	  				helpers.errorHandler('Opportunity Not Found', req, res);
	  			}
	  		})
  		}
	},

	getClosedOpenings: function (req,res) {
		
		var token = req.headers['x-access-token'];
		var id = req.params.id;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {
	  		Opening.find({_opportunity: id, status:'Closed'})
	  		.exec(function (error, opportunity) {
	  			if (opportunity.length>0) {
	  				res.status(200).send(opportunity);
	  			} else {
	  				helpers.errorHandler('Opportunity Not Found', req, res);
	  			}
	  		})
		}
	},

	getOpportunity : function (req, res) {
		var id = req.params.id.toString();
		Opportunity.findOne({ _id : id})
		.exec(function (error, opportunity) {
			if (opportunity) {
				res.status(200).send(opportunity)
			} else {
				helpers.errorHandler('Opportunity Not Found', req, res);
			}
		});
	},

	getOpportunityByOrgId : function (req, res) {
		var name = req.params.name.toString();
		Opportunity.find({_organizer : name})
		.exec(function (error, opportunity) {
			if (opportunity.length>0) {
				res.status(200).send(opportunity);
			} else {
				helpers.errorHandler('Opportunity Not Found', req, res);
			}
		});
	},

	deleteOne : function(req,res){

		var token = req.headers['x-access-token'];
		var id = req.params.id;
		var password = req.body.password;

		if (!token) {
			helpers.errorHandler('Please Sign In', req, res);
		} else {

			var org = jwt.verify(token, secret);
			Organization.findOne({username : org.username})
			.exec(function (error, organization) {
				if (organization) {
					Organization.comparePassword(password, organization.password, res, function (found) {
						if(found){
							if(organization.pastOpportunities.indexOf(id)>-1 || organization.currentOpportunities.indexOf(id)>-1){
								if (organization.pastOpportunities.indexOf(id)>-1) {
									var index = organization.pastOpportunities.indexOf(id);
									organization.pastOpportunities.splice(index, 1);
								} else {
									var index = organization.currentOpportunities.indexOf(id);
									organization.currentOpportunities.splice(index, 1);
								}	
								organization.save(function (error,saved) {
									if (saved) {
										Opportunity.findOne({_id : id}).remove()
										.exec(function (error, opportunity) {
											if (opportunity.result.n) {
												res.status(201).send('Opportunity Deleted');
											}else{
												helpers.errorHandler(error, req, res);
											}
										})
									}
								})
							}else{
								helpers.errorHandler('Wrong ID', req, res);
							}	
						}
					})
				}else{
					helpers.errorHandler('Organization Not Found', req, res);
				}
			})
		}
	}
}