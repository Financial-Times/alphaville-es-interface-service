const dedupe = require('./metadata/de-dupe');
const deletions = require('./metadata/deletions');
const displayTags = require('./metadata/display-tags');
const mappings = require('./metadata/mappings');
const photoDiary = require('./metadata/photo-diary');
const primaryTags = require('./metadata/primary-tags');
const remodel = require('./metadata/remodel');
const removeSuffixes = require('./metadata/remove-suffixes');

module.exports = (metadata) => {
	const transforms = [
		mappings,
		deletions,
		photoDiary,
		removeSuffixes,
		dedupe,
		primaryTags,
		displayTags,
		remodel
	];

	return transforms.reduce((tags, transform) => transform(tags), metadata);
};
