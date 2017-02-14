const logger = require('../../lib/logger');
const concord = require('../../lib/concord-annotations');
const metadataV1 = require('../article/metadata-v1');

module.exports = function annotationsToMetadata (annotations) {
	const getMetadata = concord.v2toV1(annotations)
		.then((concordances) => metadataV1(concordances))

	const primaryAnnotation = annotations.find(
		annotation => annotation.predicate === 'http://www.ft.com/ontology/annotation/about'
	);

	if (!primaryAnnotation) {
		logger.warn({ event: 'PLACEHOLDER_HAS_NO_PRIMARY_TAG' });
		return getMetadata;
	}

	return getMetadata.then(metadata => {

		const extraFields = {
			prefLabel: primaryAnnotation.prefLabel,
			primaryTag: true,
			teaserTag: true
		};

		return metadata.map(tag => {
			if(tag.prefLabel === extraFields.prefLabel) {
				return Object.assign(extraFields, tag);
			} else {
				//remove any others that were incorrectly added
				delete tag.primaryTag;
				delete tag.teaserTag;
				return tag;
			}
		});
	});
};
