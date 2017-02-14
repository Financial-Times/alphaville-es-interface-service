const deletions = require('../../../metadata/deletions');

module.exports = function (tags) {
	const filtered = tags.filter((tag) => !deletions.hasOwnProperty(tag.id));

	// if we're removing a primary tag then we'll try to find a replacement
	// genre tag because there is always a genre tag (🙏)
	if (filtered.some((tag) => tag.primary) === false) {
		const genre = filtered.find((tag) => tag.taxonomy === 'genre');
		genre && (genre.primary = true);
	}

	return filtered;
};
