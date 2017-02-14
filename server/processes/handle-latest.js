const logger = require('../lib/logger');
const latest = require('./get-latest');
const { update } = require('../lib/elastic');

function updateItem (id) {
	return update(id).catch((err) => {
		// don't worry too much about individual items failing
	});
}

module.exports = function (count) {
	const start = Date.now();

	logger.info('event=LATEST_UPDATER_WILL_RUN');

	return latest(count)
		.then((items) => {
			if (items.length) {
				logger.info(`event=LATEST_UPDATER_ITEMS_FOUND count=${items.length} ids="${items.join()}"`);
				return Promise.all(items.map(updateItem));
			}
		})
		.then(() => {
			const time = ((Date.now() - start) / 1000).toFixed(2);
			logger.info(`event=LATEST_UPDATER_COMPLETE time=${time}s`);
		})
		.catch((err) => {
			logger.error(`event=LATEST_UPDATER_ERROR message=${err.message}`);
		});
};
