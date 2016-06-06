'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var UserModel = function () {

	var UserSchema = mongoose.Schema({
		name: String,
		email: String,
		hashedPassword: String,
		salt: String
	});

	// Encrypt password
	UserSchema
		.virtual('password')
		.set(function (password) {
			this._password = password;
			this.salt = this.makeSalt();
			this.hashedPassword = this.encryptPassword(password);
		})
		.get(function () {
			return this._password;
		});

	// Validate empty email
	UserSchema
		.path('email')
		.validate(function (email) {
			return email.length;
		}, 'Email cannot be blank');

	// Validate empty password
	UserSchema
		.path('hashedPassword')
		.validate(function (hashedPassword) {
			return hashedPassword.length;
		}, 'Password cannot be blank');

	// Validate empty name
	UserSchema
		.path('name')
		.validate(function (name) {
			return name.length;
		}, 'First name cannot be blank');

	// Validate email is not taken
	UserSchema
		.path('email')
		.validate(function (value, respond) {
			var self = this;
			this.constructor.findOne({
				email: value
			}, function (err, user) {
				if (err) throw err;
				if (user) {
					if (self.id === user.id) return respond(true);
					return respond(false);
				}
				respond(true);
			});
		}, 'Email address already in use.');

	var validatePresenceOf = function (value) {
		return value && value.length;
	};

	UserSchema.pre('save', function (next) {
		if (!this.isNew) return next();
		if (!validatePresenceOf(this.hashedPassword)) next(new Error('Invalid password'));
		else next();
	});

	UserSchema.methods = {
		authenticate: function (plainText) {
			return this.encryptPassword(plainText) === this.hashedPassword;
		},
		makeSalt: function () {
			return crypto.randomBytes(16).toString('base64');
		},
		encryptPassword: function (password) {
			if (!password || !this.salt) return '';
			var salt = new Buffer(this.salt, 'base64');
			return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
		}
	};

	return mongoose.model('User', UserSchema);
};

module.exports = new UserModel();
