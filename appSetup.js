const cors = require('cors');
const morgan = require('morgan');
const devErrorHandler = require('errorhandler');

const errorHandler = (err, req, res, next) => {
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
};
