// this module will attempt to model the content that ingest is stuck on.
// If it is invalid it will try to delete it.
const logger = require('./logger');
const sanityCheck = require('./sanity-check');
const elastic = require('./elastic');
const dataSources = require('../data-sources');

const deleteItem = (id) => {
	return elastic.delete(id);
};

const previewItem = (id) => {
	return dataSources(id)
		.then(dataType => {
			return dataType.model();
		});
};

module.exports = function (id) {
	// this app has dyno metadata enabled
	// <https://devcenter.heroku.com/articles/dyno-metadata>
	return previewItem(id)
		.then(previewData => {
			if (previewData) {
				return previewData;
			} else {
				throw new Error(`No preview`);
			}
		})
		.then(previewData => {
			const issues = sanityCheck(previewData);

			if (issues.length) {
				const reasons = issues.map((issue) => issue.toString());
				logger.warn(`event=AUTO_REMOVE uuid=${id} reason=${reasons.join()}`);

				return deleteItem(id);
			}
		});
};
