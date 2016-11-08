const _ = require('lodash');
const config = {
	dev: 'development',
	test: 'testing',
	prod: 'production',
	port: parseInt(process.env.PORT, 10) || 5000,
	timeout: parseInt(process.env.TIMEOUT, 10) || 20000,
	id: 1,
	apiVersion: 'v1',
	fastlyKey: process.env['FASTLY_KEY'],
	serviceUrl: process.env['SERVICE_URL']
};

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

let envConfig;

try {
	envConfig = require('./' + config.env);
	envConfig = envConfig || {};
} catch(e) {
	envConfig = {};
}

module.exports = _.merge(config, envConfig);
