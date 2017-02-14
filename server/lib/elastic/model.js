const logger = require('../logger');
const dataSources = require('../../data-sources');

module.exports = (uuid) => {
	return dataSources(uuid)
		.then((dataType) => dataType.validate.model())
		.catch((err) => {
			logger.warn(`event=CONTENT_MODEL_FAILED uuid=${uuid} error=${err.toString()}`);
			throw err;
		});
};
