const xmlV2 = require('./xml-v2');
const tidyByline = require('./tidy-byline');

const SILLY_PREFIX = /http:\/\/(?:www|api)\.ft\.com\/things?\//;

// <https://docs.google.com/spreadsheets/d/1ZjJMRz5Kjfv8jkIJqO6bUBZfM7kanCcsSJroy5jqyHc/edit#gid=0>
module.exports = (article) => ({
	id: article.id ? article.id.replace(SILLY_PREFIX, '') : 'no-id',
	title: article.title,
	alternativeTitles: article.alternativeTitles,
	standfirst: article.standfirst,
	byline: tidyByline(article.byline),
	openingXML: article.openingXML ? xmlV2(article.openingXML) : undefined,
	bodyXML: article.bodyXML ? xmlV2(article.bodyXML) : undefined,
	publishReference: article.publishReference,
	publishedDate: article.publishedDate,
	// the `initialPublishedDate` field is V1 only
	// the `metadata` field is V1 only
	annotations: article.annotations || [],
	webUrl: article.webUrl,
	// we add the `url` field in the main model
	provenance: [
		// remove cachebuster
		article.requestUrl && article.requestUrl.replace(/\?cb=\d{13}/, '')
	],
	// the `originatingParty` field is V1 only
	// the `storyPackage` field is V1 only
	// we add the `mainImage` field in the main model
	standout: article.standout,
	realtime: article.realtime,
	comments: {
		enabled: article.comments ? article.comments.enabled : false
	},
	canBeSyndicated: article.canBeSyndicated,
	// we add the `attachments` field in the main model
	// we add the `_lastUpdatedDateTime` field in the main model
});
