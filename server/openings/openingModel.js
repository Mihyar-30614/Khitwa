var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var openingSchema = new Schema({
	title : { type : String, required : true},
	_opportunity: {
		type : String,
		required : true
	},
	numberOfVolunteers: Number,
	location : String,
	description : String, 
	skillsRequired : [String],
	rescources : [String],
	pendingApps: [String],
	volunteers : [String],
	rejectedApps : [String],
	status : { type : String, enum : ['Active', 'Closed'], required : true}
});

var Opening = mongoose.model( 'Opening', openingSchema);
module.exports = Opening;