const bodyV1 = require('./body-v1');
const tidyByline = require('./tidy-byline');
const extractTags = require('./extract-metadata');

const extractAlternativeTitles = (item) => {
	let promotionalTitle;

	if (item.editorial && item.editorial.otherTitles) {
		promotionalTitle = item.editorial.otherTitles[0];
	} else if (item.packaging && item.packaging.kicker) {
		promotionalTitle = `${item.packaging.kicker}: ${item.packaging.spHeadline}`;
	} else if (item.packaging && item.packaging.spHeadline) {
		promotionalTitle = item.packaging.spHeadline;
	}

	return { promotionalTitle };
};

const extractStandfirst = (item) => {
	if (item.editorial && item.editorial.standFirst) {
		return item.editorial.standFirst;
	} else if (item.summary && item.summary.excerpt) {
		return item.summary.excerpt;
	}
};

const extractStoryPackage = (storyPackage) => (
	storyPackage.map((story) => ({
		id: story.id,
		title: story.packaging.spHeadline
	}))
);

// <https://docs.google.com/spreadsheets/d/1ZjJMRz5Kjfv8jkIJqO6bUBZfM7kanCcsSJroy5jqyHc/edit#gid=0>
module.exports = ({ item, requestUrl }) => ({
	id: item.id,
	title: item.title.title,
	alternativeTitles: extractAlternativeTitles(item),
	standfirst: extractStandfirst(item),
	byline: tidyByline(item.editorial.byline),
	// the `openingXML` field is V2 only
	bodyXML: item.body && item.body.body ? bodyV1(item.body.body) : '',
	// the `publishReference` field is V2 only
	publishedDate: item.lifecycle.lastPublishDateTime,
	initialPublishedDate: item.lifecycle.initialPublishDateTime,
	metadata: extractTags(item.metadata),
	// the `annotations` field is V2 only
	webUrl: item.location.uri,
	// we add the `url` field in the main model
	provenance: [
		// remove cachebuster
		requestUrl && requestUrl.replace(/\?cb=\d{13}/, '')
	],
	originatingParty: (item.provenance && item.provenance.originatingParty) || 'FT',
	storyPackage: item.package ? extractStoryPackage(item.package) : [],
	// we add the `mainImage` field in the main model
	// the `standout` field is V2 only
	// the `realtime` field is V2 only
	// the `comments` field is V2 only
	// the `canBeSyndicated` field is V2 only
	// we add the `attachments` field in the main model
	// we add the `_lastUpdatedDateTime` field in the main model
});
