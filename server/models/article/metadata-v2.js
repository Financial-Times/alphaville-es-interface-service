'use strict';

const SILLY_PREFIX = /http:\/\/(?:www|api)\.ft\.com\/things?\//;

module.exports = (article) => {
	const tagList = [];

	article.annotations.forEach((tag) => {
		tagList.push({
			idV2: tag.id.replace(SILLY_PREFIX, ''),
			prefLabel: tag.prefLabel,
			directType: tag.directType,
			attributes: []
		});
	});

	return tagList;
};
