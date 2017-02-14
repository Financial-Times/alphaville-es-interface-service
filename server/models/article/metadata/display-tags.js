const TEASER_IGNORE_TAXONOMIES = ['organisations', 'regions', 'people'];

module.exports = function (tags) {
	const section = tags.find((tag) => tag.primary === 'section');
	const theme = tags.find((tag) => tag.primary === 'theme');
	const brand = tags.find((tag) => tag.primary === 'brand');
	// other is for section tags remapped to other tags and are relevant for teaserTag
	const other = tags.find((tag) => tag.primary && ['section', 'theme', 'brand'].includes(tag.primary) === false);
	const specialReport = tags.find((tag) => tag.primary && tag.taxonomy === 'specialReports');
	// Primary tag for display on article pages
	// - specialReport takes precedence followed by theme section and brand
	const primary = specialReport || theme || section || brand;

	if (primary) {
		primary.primaryTag = true;
	}

	// Teaser tag for display on curated lists
	// - take specialReport then primary theme, if theme not in ignored taxonomies, otherwise go back through the hierarchy of taxonomies
	const filtered = (tag) => tag && TEASER_IGNORE_TAXONOMIES.includes(tag.taxonomy) === false ? tag : null;
	const teaser = specialReport || filtered(theme) || section || brand || other;

	if (teaser) {
		teaser.teaserTag = true;
	}

	return tags;
};
