const _ = require('lodash');

module.exports = function (annotations, options) {
	const collection = _.filter(annotations, options);
	const results = [];
	_.forEach(collection, item => {
		const resultItem = _.filter(results, item);
		if (resultItem.length === 0) {
			results.push(item);
		}
	});
	return results;
};
