var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrganizationSchema = new Schema({
	EIN: String,
  name: {type: String, required: true, unique: true},
  causes_area: [String],
  locations: [String],
  missionStatement: String,
  contactInfo : Object,
  rate: Number,
  picture: String,
  currentOpportunities : [String],
  pastOpportunities : [String]
});

var Organization = mongoose.model('Organization' , OrganizationSchema);

module.exports = Organization;