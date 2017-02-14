const logger = require('../lib/logger');
const notifications = require('./get-notifications');
const elastic = require('../lib/elastic');


// Add newly created or updated items
function updateSearch (list) {
	const updateList = list

		// Filter to just update items
		.filter((item) => item.type === 'update')

		// Send a request to update (well, upsert)
		.map((item) => {
			logger.info(`event=UPDATE_NOTIFICATION uuid=${item.id}`);

			return elastic.update(item.id);
		});

	return Promise.all(updateList);
}

function deleteFromSearch (list) {
	const deleteList = list

		// Filter to just deletion items
		.filter((item) => item.type === 'delete')

		// Send a request to delete
		.map((item) => {
			logger.info(`event=DELETE_NOTIFICATION uuid=${item.id}`);

			return elastic.delete(item.id);
		});

	return Promise.all(deleteList);
}

function uniqueNotifications (list) {
	const seen = {};

	return list.filter((item) => {
		if (seen.hasOwnProperty(item.id)) {
			return false;
		} else {
			return (seen[item.id] = true);
		}
	});
}

module.exports = function (since) {
	const start = Date.now();

	logger.info('event=NOTIFICATIONS_UPDATER_WILL_RUN');

	return Promise.all([
		notifications(since, { apiVersion: 1 }),
		notifications(since, { apiVersion: 2 })
	])
		.then(([ listV1, listV2 ]) => {
			logger.info(`event=NOTIFICATIONS_UPDATER_ITEMS_FOUND count=${listV1.length} apiversion=1`);
			logger.info(`event=NOTIFICATIONS_UPDATER_ITEMS_FOUND count=${listV2.length} apiversion=2`);

			const list = uniqueNotifications([].concat(listV1, listV2));

			return Promise.all([
				updateSearch(list),
				deleteFromSearch(list)
			]);
		})
		.then(() => {
			const time = ((Date.now() - start) / 1000).toFixed(2);
			logger.info(`event=NOTIFICATIONS_UPDATER_COMPLETE time=${time}s`);
		})
		.catch((err) => {
			logger.error(`event=NOTIFICATIONS_UPDATER_ERROR message=${err.message}`);
		});
};
