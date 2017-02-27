var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var opportunitySchema = new Schema({
	title : {
		type: String, 
		required : true
	},
	_organizer : String,
	startDate : {
		type : String,
		required : true
	},
	endDate : String,
	location : String,
	causesArea : [String],
	description : String,
	skillsRequired : [String],
	poster : String, 
	currOpenings : [String],
	closedOpenings : [String],
	status : {
		type : String,
		enum : ['Active', 'Closed']
	}
});

var Opportunity = mongoose.model('Opportunity', opportunitySchema);
module.exports = Opportunity;