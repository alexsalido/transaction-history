'use strict';
var Auth = require('../../lib/auth');
var request = require('request');
var symbols = {
	USD: '$',
	EUR: '€',
	CAD: '$',
	MXN: '$',
	CNY: '¥',
	INR: '&#20B9;'
};

module.exports = function (router) {

	router.get('/', Auth.isAuthenticated(), function (req, res) {
		var error = res.locals.message;
		res.render('rates', {
			user: req.session.user,
			error: error
		});
	});

	router.get('/calculate', Auth.isAuthenticated(), function (req, res) {

		request({
			url: 'https://openexchangerates.org/api/latest.json?app_id=975cd1d7e3de45ca875d27158e755792',
			json: true
		}, function (err, response) {
			if (!err && response.statusCode === 200) {
				var result = {};
				result.result = (response.body.rates[req.query.currency] * req.query.amount).toFixed(2);
				result.amount = Number(req.query.amount).toFixed(2);
				result.currency = req.query.currency;
				result.symbol = symbols[req.query.currency];
				return res.send(result);
			}
			req.session.error = 'Unknown error, please try again.';
			res.redirect('/rates');
		});

	});
};
