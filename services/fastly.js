const config = require('../config');
const fastly = require('fastly')(config.fastlyKey);
const Promise = require('bluebird');

const purge = (path) => {
	return new Promise((resolve, reject) => {
		fastly.purge(config.serviceUrl, path, (err, obj) => {
			if (err) {
				return reject(err);
			}
			return resolve(obj);
		});
	});
};
module.exports = {
	purge
};
