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
	      helpers.errorHandler('Please Sign In', req, res);
	    } else {

	    	var opportunityId = req.params.id;
	    	var organization = jwt.decode(token,'secret');
			var newOpening = new Opening({
				title : req.body.title,
				_opportunity : opportunityId,
				_organizer : organization.name,
				numberOfVolunteers : req.body.numberOfVolunteers,
				location : req.body.location,
				description : req.body.description,
				skillsRequired : req.body.skillsRequired,
				resources : req.body.resources,
				status : req.body.status
			})

	    	Organization.findOne({name : organization.name})
	    	.exec(function (error, org) {
	      		if (org) {
		      		Opportunity.findOne({_id : opportunityId})
		      		.exec(function (error, opp) {
		      			if (opp) {
		      				if (org.name === opp._organizer) {
		      					newOpening.save(function (error, saved) {
		      						if (saved) {
		      							opp.currOpenings.push(saved._id);
		      							opp.save(function (error, oppSaved) {
		      								if (oppSaved) {
		      									res.status(201).send('Opening Added');
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

	    if (!token) {
	    	helpers.errorHandler('Please Sign In', req, res);
	    } else {

			var org = jwt.decode(token, 'secret');

			Opening.findOne({_id : id})
			.exec(function (error, opening) {
				if (opening) {
					Opportunity.findOne({_id : opening._opportunity})
					.exec(function (error, opportunity) {
						if (opportunity) {
							if (opportunity._organizer === org.name) {
								var index = opportunity.currOpenings.indexOf(id);
								if (index > -1) {
									opportunity.currOpenings.splice(index, 1);
									opportunity.closedOpenings.push(id);
									opportunity.save(function (error, saved) {
										opening.status = 'Closed';
										opening.save(function (error, openSaved) {
											res.status(201).send('Opening Closed');
										})
									})
								} else {
									helpers.errorHandler('Opening is Already Closed', req, res);
								}
							} else {
								helpers.errorHandler('Can Not Modify Others', req, res);
							}
						} else {
							helpers.errorHandler('Opportunity Not Found', req, res);
						}
					})
				} else {
					helpers.errorHandler('Opening Not Found', req, res);
				}
			})
		}
	},

	deleteOne : function(req, res){
    
	    var token = req.headers['x-access-token'];
	    var id = req.params.id;

	    if (!token) {
	    	helpers.errorHandler('Please Sign In', req, res);
	    } else {
	    	Opening.findOne({ _id:id})
	    	.exec(function (error, opening) {
	        	if (opening) {
	        		var oppId = opening._opportunity;

	    			Opening.findOne({ _id : id}).remove()
	        		.exec(function (error, open) {
	            		if (open.result.n) {
	            			Opportunity.findOne({ _id : oppId})
	            			.exec(function (error, opportunity) {
		                		if (opportunity.currOpenings.indexOf(id)>-1 || opportunity.closedOpenings.indexOf(id)>-1) {
		                			if(opportunity.currOpenings.indexOf(id)>-1){
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
	            			helpers.errorHandler(error, req, res);
	            		}
	        		})
	        	}else{
	        		helpers.errorHandler('Opening Not Found', req, res);
	        	}
	    	})
	    }
	},

	editOpening : function (req, res) {

	    var token = req.headers['x-access-token'];
	    var id = req.params.id.toString();

	    if (!token) {
	    	helpers.errorHandler('Please Sign In', req, res);
	    } else {
	    	var organization = jwt.decode(token, 'secret');
	    	Opening.findOne({ _id : id })
	    	.exec(function (error, opening) {
		        if (opening) {
	    			if (opening._organizer === organization.name) {
						opening.title = req.body.title || opening.title;
						opening.numberOfVolunteers = req.body.numberOfVolunteers || opening.numberOfVolunteers;
						opening.location = req.body.location || opening.location;
						opening.description = req.body.description || opening.description;
						opening.skillsRequired = req.body.skillsrequired || opening.skillsrequired;
						opening.resources = req.body.resources || opening.resources;

						opening.save(function (error,saved) {
							if (saved) {
								res.status(201).send(saved);
							}
						})
					} else {
	    				helpers.errorHandler('Can Not Modify Others', req, res);
					}
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
	    	helpers.errorHandler('Please Sign In', req, res);
	    } else {
	    	var user = jwt.decode(token,'secret');
	    	User.findOne({username : user.username})
	    	.exec(function (error, usr) {
	        	if (usr) {
	        		if (usr.username === user.username) {
			        	Opening.findOne({ _id : id})
			        	.exec(function (error, opening) {
			        		if (opening) {
			                	var index = opening.pendingApps.indexOf(user.username);
			            		if (index === -1) {
			                		opening.pendingApps.push(user.username);
			                		opening.save(function (error, saved) {
			                    		if (saved) {
			                    			res.status(201).send('User Applied');
			                    		}
			                  		})
			              		} else {
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
	        			helpers.errorHandler('Can Not Modify Others', req, res);
	        		}
	        	} else {
	        		helpers.errorHandler('User Not Found', req, res);
	        	}
	    	})
	    }
	},

	approveVolunteer: function (req, res){

    	var token = req.headers['x-access-token'];
    	var openingId = req.params.id.toString();
    	var appName = req.body.appName;

    	if (!token) {
    		helpers.errorHandler('Please Sign In', req, res);
    	} else {
    		var user = jwt.decode(token,'secret');
    		Organization.findOne({ name : user.name})
    		.exec(function (error, org) {
        		if (org) {
          			Opening.findOne({ _id : openingId })
        			.exec(function (error, opening) {
            			if (opening) {
            				if (opening._organizer === user.name) {
								var index = opening.pendingApps.indexOf(appName);
								var index2 = opening.rejectedApps.indexOf(appName);
	            				if (index > -1) {        					
									opening.pendingApps.splice(index,1);
	            				} else if(index2 > -1){
	            					opening.rejectedApps.splice(index2,1);
	            				}else{
	            					helpers.errorHandler('User Not Found', req, res);
	            				}
								opening.volunteers.push(appName);
								opening.save(function (error, saved) {
	                				if (saved) {
	                					res.status(201).send('User Approved');
	                				}
	              				})
            				} else {
            					helpers.errorHandler('Can Not Modify Others', req, res);
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

	rejectVolunteer: function (req, res){

    	var token = req.headers['x-access-token'];
    	var openingId = req.params.id.toString();
    	var appName = req.body.appName;

    	if (!token) {
    		helpers.errorHandler('Please Sign In', req, res);
    	} else {
    		var user = jwt.decode(token,'secret');
    		Organization.findOne({ name : user.name})
    		.exec(function (error, org) {
        		if (org) {
        			Opening.findOne({ _id : openingId })
        			.exec(function (error, opening) {
            			if (opening) {
            				if (opening._organizer === user.name) {
	            				var index = opening.pendingApps.indexOf(appName);
	            				var index2 = opening.volunteers.indexOf(appName);
	            				if (index>-1) {
					                opening.pendingApps.splice(index,1);
	            				}else if (index2>-1) {
	            					opening.volunteers.splice(index2,1);
	            				} else {
	                				helpers.errorHandler('User Not Found', req, res);
	            				}
				                opening.rejectedApps.push(appName);
				                opening.save(function (error, saved) {
	            					if (saved) {
	                					res.status(201).send('User Rejected');
	            					}
	            				})
            				} else {
            					helpers.errorHandler('Can Not Modify Others', req, res);
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
			if (opening) {
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
	    	helpers.errorHandler('Please Sign In', req, res);
	    } else {

	    	var org = jwt.decode(token, 'secret');
	    	
	    	Opening.findOne({_id : id})
	    	.exec(function (error, opening) {
	    		if (opening) {
	    			var oppID = opening._opportunity;

	    			Opportunity.findOne({_id : oppID})
	    			.exec(function (error, opportunity) {
	    				if (opportunity) {
	    					if (opportunity._organizer === org.name) {
	    						var index = opportunity.closedOpenings.indexOf(id);
	    						if (index > -1) {
	    							opportunity.closedOpenings.splice(index,1);
	    							opportunity.currOpenings.push(id);
	    							opening.status = 'Active';
	    							opportunity.save(function (error, saved) {
	    								if (saved) {
	    									opening.save(function (error, openSaved) {
	    										if (openSaved) {
	    											res.status(201).send('Opening Reopened');
	    										}
	    									})
	    								}
	    							})
	    						} else {
	    							helpers.errorHandler('No Such Opening Closed', req, res);
	    						}
	    					} else {
	    						helpers.errorHandler('Can Not Modify Others', req, res);
	    					}
	    				} else {
	    					helpers.errorHandler('Opportunity Not Found', req, res);
	    				}
	    			})
	    		} else {
	    			helpers.errorHandler('Opening Not Found', req, res);
	    		}
	    	})
	    }
	}
}