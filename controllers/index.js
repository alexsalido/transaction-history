'use strict';

var IndexModel = require('../models/index');
var User = require('../models/userModel');
var Auth = require('../lib/auth');

// User.find({}).remove(function () {
// 	console.log('Deleted existing users.');
// });

module.exports = function (router) {

	var model = new IndexModel();

	router.get('/', function (req, res) {
		model.error = res.locals.message;
		res.render('index', model);
	});

	router.get('/users', function (req, res) {
		User.find({}, function (err, users) {
			if (err) console.log(err);
			res.send(users);
		});
	});

	router.post('/signup', function (req, res) {
		var newUser = User(req.body);
		newUser.save(function (err, user) {
			if (err) {
				for (var errName in err.errors) {
					req.session.error = err.errors[errName].message;
					return res.redirect('/');
				}
			}
			req.session.user = {
				id: user._id,
				name: user.name
			};
			res.redirect('/dashboard');
		});
	});

	router.post('/login', function (req, res) {
		User.findOne({
			email: req.body.email
		}, function (err, user) {
			if (err) {
				req.session.error = 'Unknown error, please try again.';
				res.redirect('/');
			}
			if (user && user.authenticate(req.body.password)) {
				req.session.user = {
					id: user._id,
					name: user.name
				};
				return res.redirect('/dashboard');
			}
			req.session.error = 'Authentication failed.';
			res.redirect('/');
		});
	});

	router.all('/logout', function (req, res) {
		delete req.session.user;
		res.redirect('/');
	});
};
