const Model = require('./model');
const normalizeV2 = require('./article/normalize-v2');
const alternativeImageV2 = require('./placeholder/alternative-image-v2');
const annotationsToMetadata = require('./placeholder/annotations-to-metadata');

module.exports = function placeholder ({ capiV2 }) {
	const model = new Model();

	const normalized = normalizeV2(capiV2);

	model.set('type', 'placeholder');

	model.set('id', normalized.id);

	model.set('title', capiV2.title || capiV2.alternativeTitles.promotionalTitle);

	model.set('alternativeTitles', capiV2.alternativeTitles);

	model.set('publishedDate', capiV2.publishedDate);

	model.set('url', capiV2.webUrl);

	model.set('standfirst', capiV2.alternativeStandfirsts.promotionalStandfirst);

	model.set('mainImage', alternativeImageV2(capiV2.alternativeImages.promotionalImage));

	model.set('metadata', annotationsToMetadata(capiV2.annotations));

	model.set('provenance', normalized.provenance);

	return model.done();
};
