var mongoose = require('mongoose');
var Q = require('q');
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

var OrganizationSchema = new Schema({
  name: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  causes_area: [String],
  locations: [String],
  missionStatement: String,
  contactInfo : Object,
  rate: Number,
  picture: String,
  currentOpportunities : [String],
  pastOpportunities : [String],
  salt : String
});

OrganizationSchema.pre('save', function (next) {
  var organization = this;

  // only hash the password if it has been modified (or is new)
  if (!organization.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      return next(err);
    }
    // hash the password along with our new salt
    bcrypt.hash(organization.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }
      // override the cleartext password with the hashed one
      organization.password = hash;
      organization.salt = salt;
      next();
    });
  });
});

var Organization = mongoose.model('Organization' , OrganizationSchema);

Organization.comparePassword = function(candidatePassword, savedPassword, res, cb){
  bcrypt.compare( candidatePassword, savedPassword, function(err, isMatch){
    if(!isMatch){
      res.status(500).send('Wrong Password');
    } else if(isMatch){
      cb(isMatch);
    }else{
      res.status(500).send(err);
    }
  });
};

module.exports = Organization;