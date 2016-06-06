'use strict';

var express = require('express');
var kraken = require('kraken-js');
var db = require('./lib/database');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function(config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
        var databaseConfig = config.get('databaseConfig');
        db.config(databaseConfig);
        next(null, config);
    }
};

app = module.exports = express();
app.use(kraken(options));

app.use(session({
    secret: 'transactionHistory',
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = '';
    if (err) res.locals.message = err;
    next();
});

app.on('start', function() {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});
