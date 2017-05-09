const _ = require('lodash');

module.exports = function (metadata, options) {
	const collection = _.filter(metadata, options);
	const results = [];
	_.forEach(collection, item => {
		const resultItem = _.filter(results, item);
		if (resultItem.length === 0) {
			item.primaryTag = 0;
			results.push(item);
		} else {
			resultItem.primaryTag = 1;
		}
	});
	return _.orderBy(results, ['primaryTag'], ['desc']);
};
