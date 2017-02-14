const mappings = require('../../../metadata/map');

module.exports = function (tags) {
	// we merge the replacement tag so we preserve the `primary` property
	tags.forEach((tag) => {
		if (mappings[tag.id]) {
			Object.assign(tag, mappings[tag.id].term);
		}
	});

	return tags;
};
