const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
	local: {
		email: String,
		name: String,
		password: String,
    registerDate: Date,
    passwordReset: {
      resetPasswordToken: String,
      resetPasswordExpires: Date
    },
    profile: {
      savedCompanies: [],
      downloadedCompanies: []
    }
	},
	twitter: {
		id: String,
    token: String,
    displayName: String,
    username: String,
    registerDate: Date
	},
	google: {
		id: String,
    accessToken: String,
    name: String,
    email: String,
    registerDate: Date
	},
	facebook: {
		id: String,
    accessToken: String,
    name: String,
    email: String,
    registerDate: Date
	}
});
userSchema.methods.setPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
userSchema.methods.validatePassword = function(password, err) {
	return bcrypt.compareSync(password, this.local.password);
}
userSchema.methods.generateJwt = function() {
  var expire = new Date();
  expire.setDate(expire.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.local.email,
    name: this.local.name,
    exp: parseInt(expire.getTime() / 1000)
  }, process.env.CONFIG_SR);
};
userSchema.methods.generateTwitterJwt = function() {
  var expire = new Date();
  expire.setDate(expire.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    displayName: this.twitter.displayName,
    username: this.twitter.username,
    exp: parseInt(expire.getTime() / 1000)
  }, process.env.CONFIG_SR);
};
userSchema.methods.generateGoogleJwt = function() {
  var expire = new Date();
  expire.setDate(expire.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.google.email,
    name: this.google.name,
    exp: parseInt(expire.getTime() / 1000)
  }, process.env.CONFIG_SR);
}
userSchema.methods.generateFacebookJwt = function() {
  var expire = new Date();
  expire.setDate(expire.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.google.email,
    name: this.google.name,
    exp: parseInt(expire.getTime() / 1000)
  }, process.env.CONFIG_SR);
}
module.exports = mongoose.model('User' , userSchema);