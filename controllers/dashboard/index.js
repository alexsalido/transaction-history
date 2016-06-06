'use strict';

var Transaction = require('../../models/transactionModel');
var User = require('../../models/userModel');
var request = require('request');
var Auth = require('../../lib/auth');
var mongoose = require('mongoose');

Transaction.find({}).remove(function () {
	console.log('Deleted existing transactions.');
});

module.exports = function (router) {

	router.get('/', Auth.isAuthenticated(), function (req, res) {
		Transaction.aggregate([{
				$match: {
					user: mongoose.Types.ObjectId(req.session.user.id)
				}
			}, {
				$project: {
					date: 1,
					type: 1,
					business: 1,
					amount: {
						$filter: {
							input: '$amount',
							as: 'amount',
							cond: {
								$eq: ['$$amount.currency', 'USD']
							}
						}
					}
				}
			}],
			function (err, transactions) {
				if (err) {
					req.session.error = 'Unknown error, please try again.';
				}

				var model = {
					transactions: transactions,
					user: req.session.user
				};

				res.render('dashboard', model);
			});
	});

	router.post('/transaction', Auth.isAuthenticated(), function (req, res) {
		request({
			url: 'https://openexchangerates.org/api/historical/' + req.body.date + '.json?app_id=975cd1d7e3de45ca875d27158e755792&',
			json: true
		}, function (err, response) {
			if (!err && response.statusCode === 200) {

				var conversion = response.body.rates['USD'] / response.body.rates[req.body.currency] * req.body.amount;

				var rates = [{
					currency: 'USD',
					value: (response.body.rates['USD'] * conversion).toFixed(2),
					symbol: '$'
				}, {
					currency: 'EUR',
					value: (response.body.rates['EUR'] * conversion).toFixed(2),
					symbol: '€'
				}, {
					currency: 'CAD',
					value: (response.body.rates['CAD'] * conversion).toFixed(2),
					symbol: '$'
				}, {
					currency: 'MXN',
					value: (response.body.rates['MXN'] * conversion).toFixed(2),
					symbol: '$'
				}, {
					currency: 'CNY',
					value: (response.body.rates['CNY'] * conversion).toFixed(2),
					symbol: '¥'
				}, {
					currency: 'INR',
					value: (response.body.rates['INR'] * conversion).toFixed(2),
					symbol: '&#20B9'
				}];

				rates[req.body.currency] = parseInt(req.body.amount).toFixed(2);

				var newTransaction = new Transaction({
					date: req.body.date,
					type: req.body.type,
					business: req.body.business,
					amount: rates,
					user: req.session.user.id
				});

				newTransaction.save(function (err, transaction) {
					if (err) {
						req.session.error = 'Unknown error, please try again.';
					}

					res.redirect('/dashboard');
				});
			}
		});

	});

	router.get('/transactions', Auth.isAuthenticated(), function (req, res) {

		Transaction.aggregate([{
			$match: {
				user: mongoose.Types.ObjectId(req.session.user.id)
			}
		}, {
			$project: {
				date: 1,
				type: 1,
				business: 1,
				user: 1,
				amount: {
					$filter: {
						input: '$amount',
						as: 'amount',
						cond: {
							$eq: ['$$amount.currency', req.query.currency]
						}
					}
				}
			}
		}], function (err, transactions) {
			if (err) {
				req.session.error = 'Unknown error, please try again.';
			}

			var model = {
				transactions: transactions
			};

			res.send(model);
		});
	});
};
