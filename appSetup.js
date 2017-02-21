const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const devErrorHandler = require('errorhandler');
const ftwebservice = require('express-ftwebservice');
const healthcheck = require('./health/healthchecks');

// catch 404 and forward to error handler
const notFoundHandler = function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
};

const errorHandler = (err, req, res, next) => {
	res.set('Cache-Control', 'private, no-cache, no-store');

	if (err.status === 404) {
		res.status(404);
		res.render('error_404');
	} else {
		res.status(503).send('<p>Internal Server Error</p>');
		console.error(err.stack);
		next(err);
	}
};

module.exports = (app, config) => {
	app.use(cors());

	ftwebservice(app, {
		manifestPath: path.join(__dirname, 'package.json'),
		about: {
			"schemaVersion": 1,
			"name": "ftalphaville-es-interface-service",
			"purpose": "Serving article data from Next Elastic and Alphaville Wordpress with Alphaville specific transformations.",
			"audience": "public",
			"primaryUrl": "https://ftalphaville-es-interface-service.ft.com",
			"serviceTier": "gold"
		},
		goodToGoTest: function() {
			return new Promise(function(resolve) {
				resolve(true);
			});
		},
		healthCheck: function() {
			return healthcheck.getChecks().then(checks => {
				return checks;
			}).catch((err) => {
				console.log(err);
				return [
					{
						name: "Healthcheck",
						ok: false,
						severity: 2,
						businessImpact: "Some areas of the application might be unavailable due to the issue.",
						technicalSummary: "Healthcheck is not available.",
						panicGuide: "Check the logs of the application, try to restart it from heroku.",
						checkOutput: "Healthcheck generation failed.",
						lastUpdated: new Date().toISOString()
					}
				];
			});
		}
	});

	if (config.env === config.dev) {
		app.use(notFoundHandler);
		app.use(devErrorHandler());
		app.use(morgan('dev'));
	} else {
		app.user(notFoundHandler);
		app.use(errorHandler);
	}
};
