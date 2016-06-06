var compose = require('composable-middleware');

function isAuthenticated() {
	return compose().use(function(req, res, next) {
		if (req.session.user) {
			next();
		} else {
			req.session.error = 'Access denied!';
			res.redirect('/');
		}
	});
}

exports.isAuthenticated = isAuthenticated;
