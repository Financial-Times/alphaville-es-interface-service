const COMMENT_TAG_ID = 'OA==-R2VucmVz';

module.exports = function (tags) {
	// Primary section is always a section
	const section = tags.find((tag) => tag.primary && tag.taxonomy === 'sections');

	if (section) {
		section.primary = 'section';
	}

	// Primary theme is usually a topic tag, but not always
	const theme = tags.find((tag) => tag.primary && tag.taxonomy !== 'sections');

	if (theme) {
		theme.primary = 'theme';
	}

	// set the author to a brand if it's a comment piece and isn't otherwise branded
	const brand = tags.find((tag) => tag.taxonomy === 'brand');
	const author = tags.find((tag) => tag.taxonomy === 'authors');

	if (brand) {
		brand.primary = 'brand';
	} else if (author && tags.some((tag) => tag.id === COMMENT_TAG_ID)) {
		author.primary = 'brand';
	}

	const hasPrimaryTag = tags.find(({ primary }) => primary);
	if (!hasPrimaryTag) {
		const section = tags.find(({ taxonomy }) => taxonomy === 'sections');
		if (section) {
			section.primary = 'section'
		}
	}

	return tags;
};
