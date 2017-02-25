var Q = require('q');
var mongoose = require('mongoose');

var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String,	required: true },
  bio : String,
  email: String,
  dateOfBirth: String,
  gender: String,
  phoneNumber: String,
  skills: [String],
  awards: [{ organization:String, rate:Number, review:String}],
  rate: {type:Number, default:0},
  picture: String,
  salt: String
});

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

var User = mongoose.model('User' , UserSchema);

User.comparePassword = function(candidatePassword, savedPassword, res, cb){
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

module.exports = User;