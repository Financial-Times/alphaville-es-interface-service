const { metadataFor } = require('n-podcast-mapping');

module.exports = function (showUrl) {
	const slug = showUrl.replace(/https?:\/\/rss\.acast\.com\//, '');
	const tags = metadataFor(slug);

	tags.push({
		id: 'NjI2MWZlMTEtMTE2NS00ZmI0LWFkMzMtNDhiYjA3YjcxYzIy-U2VjdGlvbnM=',
		taxonomy: 'sections',
		name: 'Podcasts'
	});

	// find the primary section and flag it
	const primarySection = tags.find((tag) => tag.taxonomy === 'primarySection') || tags[0];

	primarySection.taxonomy = 'sections';
	primarySection.primary = true;

	return tags;
};
