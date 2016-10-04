var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var openingSchema = new Schema({
	title : { type : String, required : true},
	_opportunity: {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Opportunity',
		required : true
	},
	numberOfVolunteers: Number,
	location : String,
	description : String, 
	skillsRequired : [String],
	rescources : [String],
	pendingApps: [{ type : mongoose.Types.ObjectId, ref : 'User'}],
	volunteers : [{ type : mongoose.Types.ObjectId, ref : 'User'}],
	rejectedApps : [{ type : mongoose.Types.ObjectId, ref : 'User'}],
	status : { type : String, enum : ['Active', 'Closed'], required : true}
});

var Opening = mongoose.model( 'Opening', openingSchema);
module.exports = Opening;