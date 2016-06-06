'use strict';

var mongoose = require('mongoose');

var transactionModel = function () {

	var transactionSchema = mongoose.Schema({
		date: String,
		type: String,
		business: String,
		amount: Array,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
	});

	return mongoose.model('Transaction', transactionSchema);
};

module.exports = new transactionModel();
