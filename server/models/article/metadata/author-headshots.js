const removeDiacritics = require('diacritics').remove;
const logger = require('../../../lib/logger');
const HEADSHOT_PREFIX = 'fthead-v1';
const IMAGE_SERVICE = 'https://www.ft.com/__origami/service/image/v2/images/raw/';

const validateAuthorHeadshot = (tag) => {
	const fileName = removeDiacritics(tag.prefLabel).toLowerCase().replace(/(\s|')+/g,'-');
	const url = `${IMAGE_SERVICE}${HEADSHOT_PREFIX}:${fileName}?source=alphaville`;
	return fetch(url, {
		timeout: 2000,
		method: 'head',
	})
	.then(response => {
		if (response.ok) {
			tag.attributes.push({key: 'headshot', value: `${HEADSHOT_PREFIX}:${fileName}`});
		}
	})
	.catch(err => {
		logger.warn(`event=AUTHOR_HEADSHOT_FAILED fileName=${fileName} error="${err}"`);
	});
};

module.exports = (tags) => {
	const authorTags = tags.filter(tag => tag.taxonomy === 'authors');
	const headshotPromises = [];

	authorTags.map(tag => {
		headshotPromises.push(validateAuthorHeadshot(tag));
	});

	// return the original array
	return Promise.all(headshotPromises).then(() => tags);
};
