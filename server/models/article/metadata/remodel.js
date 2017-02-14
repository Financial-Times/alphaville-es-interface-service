// See the mapping to ensure we're setting the correct properties
function model (tag) {
	return Object.assign({}, tag, {
		// id => idV1 (for when we concord V2 IDs)
		id: undefined,
		idV1: tag.id,
		// name => prefLabel (to make the transition to annotations easier)
		name: undefined,
		prefLabel: tag.name,
		// add the URL so we don't endlessly construct them elsewhere
		url: `https://www.ft.com/stream/${tag.taxonomy}Id/${tag.id}`
	});
}

module.exports = function (tags) {
	return tags.map(model);
};
