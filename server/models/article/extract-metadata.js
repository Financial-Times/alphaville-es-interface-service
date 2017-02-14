const predicates = {
	object: ['primaryTheme', 'primarySection'],
	array: [
		// ignore the icb, iptc, mediaType and subjects tags
		'authors', 'brand', 'genre',
		'organisations', 'people', 'regions',
		'sections', 'specialReports', 'topics'
	]
};

module.exports = function (metadata) {
	const tags = [];

	predicates.object.forEach((item) => {
		if (metadata[item]) {
			tags.push(
				Object.assign(metadata[item].term, { primary: true })
			);
		}
	});

	predicates.array.forEach((item) => {
		if (Array.isArray(metadata[item])) {
			metadata[item].forEach((tag) => {
				tag.term.id && tags.push(tag.term);
			});
		}
	});

	return tags;
};
