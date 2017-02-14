module.exports = function (tags) {
	const seen = {};

	return tags.filter((tag) => (
		seen.hasOwnProperty(tag.id) ? false : (seen[tag.id] = true)
	));
};
