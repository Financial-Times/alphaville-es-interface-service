const Model = require('./model');
const metadataV1 = require('./article/metadata-v1');
const metadataV2 = require('./article/metadata-v2');
const normalizeV2 = require('./article/normalize-v2');
const extractRenditions = require('./video/extract-renditions');
const extractStoryPackage = require('./video/extract-story-package');
const extractMainImage = require('./video/extract-main-image');
const concord = require('../lib/concord-annotations');

const resolveMetadata = (annotations = [], tags = []) => (
	concord.v2toV1(annotations)
		.then((concordances) => metadataV1(concordances.concat(tags)))
);

function video ({ capiV2, brightcove, videoEditor }) {
	const model = new Model();

	const normalV2 = normalizeV2(capiV2);

	model.set('type', 'video');

	model.set('id', normalV2.id);

	model.set('title', normalV2.title);

	model.set('alternativeTitles', normalV2.alternativeTitles || {});

	model.set('standfirst', brightcove.metadata.description);

	model.set('byline', normalV2.byline);

	model.set('bodyHTML', `<p>${brightcove.metadata.long_description}</p>`);

	model.set('publishReference', normalV2.publishReference);

	model.set('publishedDate', normalV2.publishedDate);

	model.set('metadata', resolveMetadata(capiV2.annotations, videoEditor && videoEditor.tags));

	// TODO: move annotations transform to normalize step
	// TODO: update annotations fn to accept an array of concepts instead whole content obj
	model.set('annotations', metadataV2(capiV2));

	model.set('webUrl', normalV2.webUrl);

	model.set('url', `https://www.ft.com/content/${normalV2.id}`);

	model.set('provenance', [].concat([
		normalV2.provenance,
		`https://cms.api.brightcove.com/v1/accounts/${process.env.BRIGHTCOVE_ACCOUNT_ID}/videos/${brightcove.metadata.id}`,
		videoEditor && `https://next-video-editor.ft.com/api/V1/${brightcove.metadata.id}`
	]));

	model.set('storyPackage', extractStoryPackage(brightcove.metadata));

	model.set('mainImage', extractMainImage(brightcove.metadata));

	model.set('standout', {});

	model.set('attachments', extractRenditions(brightcove.renditions));

	// Append last updated time for internal use
	model.set('_lastUpdatedDateTime', new Date().toISOString());

	return model.done();
}

module.exports = video;
