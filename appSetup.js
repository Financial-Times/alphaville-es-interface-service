const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const devErrorHandler = require('errorhandler');
const ftwebservice = require('express-ftwebservice');
const healthcheck = require('./health/healthchecks');

const errorHandler = (err, req, res, next) => {
	res.set('Cache-Control', 'private, no-cache, no-store');

	res.status(500).send('<p>Internal Server Error</p>');
	console.error(err.stack);
	next(err);
};

module.exports = (app, config) => {
	app.use(cors());
	if (config.env === config.dev) {
		app.use(devErrorHandler());
		app.use(morgan('dev'));
	} else {
		app.use(errorHandler);
	}

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
};




// force GC to 80% of available memory
const v8 = require('v8');

module.exports = () => {
	if(process.env.WEB_MEMORY) {
		const gcMemory = Math.floor(parseInt(process.env.WEB_MEMORY, 10) * 4 / 5);
		v8.setFlagsFromString(`--max_old_space_size=${gcMemory}`);
	}
};
