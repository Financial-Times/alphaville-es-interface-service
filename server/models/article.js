const deepmerge = require('deepmerge');

const ftContent = require('./article/ft-content');
const xslt = require('./article/xslt');

const normalizeV1 = require('./article/normalize-v1');
const normalizeV2 = require('./article/normalize-v2');

// TODO: re-name module
const metadata = require('./article/metadata-v1');
const authorHeadshots = require('./article/metadata/author-headshots');
// TODO: move file into /article/metadata
const vanitiseMetadataUrls = require('./article/vanitise-metadata-urls');

// TODO: re-name module
const annotations = require('./article/metadata-v2');

const mainImageV1 = require('./article/main-image-v1');
const mainImageV2 = require('./article/main-image-v2');

// TODO: re-name module
const normalizeUrl = require('./article/normalize-url');
const fixFastFT = require('./article/fix-fastft');

const Model = require('./model');

function article ({ capiV1, capiV2 }) {
	const model = new Model();

	// Rather than write lots of ternary statements let's just make
	// both APIs speak the same language...
	const normalV1 = capiV1 ? normalizeV1(capiV1) : {};
	const normalV2 = capiV2 ? normalizeV2(capiV2) : {};

	// We prefer most properties from V2 but they're not essential
	const merged = deepmerge(normalV1, normalV2);

	model.set('type', 'article');

	model.set('id', merged.id);

	model.set('title', merged.title);

	model.set('alternativeTitles', merged.alternativeTitles);

	model.set('standfirst', merged.standfirst);

	model.set('byline', merged.byline);

	// Only available from V2
	// TODO: kill openingXML field
	if (normalV2.openingXML) {
		const openingXML = ftContent(normalV2.openingXML);

		model.set('openingXML', openingXML);
		model.set('openingHTML', openingXML.then(xslt));
	}

	// V1 body is simplified and doesn't need processing further
	// TODO: kill bodyXML field
	if (normalV2.bodyXML) {
		const bodyXML = ftContent(normalV2.bodyXML);

		model.set('bodyXML', bodyXML);
		model.set('bodyHTML', bodyXML.then(xslt));
	} else {
		model.set('bodyXML', normalV1.bodyXML);
		model.set('bodyHTML', normalV1.bodyXML);
	}

	// Only available from V2
	if (merged.publishReference) {
		model.set('publishReference', merged.publishReference);
	}

	model.set('publishedDate', merged.publishedDate);

	// Only available from V1
	if (merged.initialPublishedDate) {
		model.set('initialPublishedDate', merged.initialPublishedDate);
	}

	// Only available from V1 but set a default
	model.set('metadata', (
		Promise.resolve(metadata(merged.metadata || []))
			.then(authorHeadshots)
			.then(vanitiseMetadataUrls)
	));

	// HACK: FastFT content often has missing metadata or is not tagged as FastFT...
	if (merged.webUrl && merged.webUrl.includes('ft.com/fastft')) {
		model.get('metadata').then((tags) => {
			model.set('metadata', fixFastFT(merged.id, tags));
		});
	}

	// Store V2 annotations
	// TODO: update annotations fn to accept an array of concepts instead whole content obj
	if (capiV2) {
		model.set('annotations', annotations(capiV2));
	}

	// Prefer original webUrl from V1 because V2 doesn't contain the content level (0, 1, etc)
	model.set('webUrl', normalV1.webUrl || normalV2.webUrl);

	// Vanitise URLs
	model.set('url', normalizeUrl(merged.id, merged.webUrl));

	model.set('provenance', merged.provenance);

	// Only available from V1 but set a default
	model.set('originatingParty', normalV1.originatingParty || 'FT');

	// Only available from V1 but set a default
	model.set('storyPackage', normalV1.storyPackage || []);

	if (capiV2) {
		model.set('mainImage', mainImageV2(capiV2));
	} else if (capiV1) {
		model.set('mainImage', mainImageV1(capiV1));
	}

	// Only available from V2 but set a default
	model.set('standout', merged.standout || {});

	// Only available from V2 but set a default
	model.set('realtime', merged.realtime || false);

	// Only available from V2 but set a default
	model.set('comments', merged.comments || { enabled: false });

	// Only available from V2
	if (merged.canBeSyndicated) {
		model.set('canBeSyndicated', merged.canBeSyndicated);
	}

	// Append last updated time for internal use
	model.set('_lastUpdatedDateTime', new Date().toISOString());

	return model.done();
}

module.exports = article;
