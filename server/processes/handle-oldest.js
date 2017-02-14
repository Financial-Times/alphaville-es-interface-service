const logger = require('../lib/logger');
const oldest = require('./get-oldest');
const { bulk } = require('../lib/elastic');

module.exports = function (count) {
	const start = Date.now();

	logger.info('event=OLDEST_UPDATER_WILL_RUN');

	return oldest(count)
		.then((items) => {
			if (items && items.length) {
				logger.info(`event=OLDEST_UPDATER_ITEMS_FOUND count=${count} oldest=${items[0].lastUpdated}`);
				return bulk(items.map((item) => item.id));
			}
		})
		.then(() => {
			const time = ((Date.now() - start) / 1000).toFixed(2);
			logger.info(`event=OLDEST_UPDATER_COMPLETE time=${time}s`);
		})
		.catch((err) => {
			logger.error(`event=OLDEST_UPDATER_ERROR message=${err.message}`);
		});
};
