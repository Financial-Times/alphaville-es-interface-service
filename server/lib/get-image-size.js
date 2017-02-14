'use strict';

const fetchres = require('fetchres');
const logger = require('./logger');

module.exports = (image) => {
	const imageUrl = encodeURIComponent(image);
	const url = `https://www.ft.com/__origami/service/image/v2/images/metadata/${imageUrl}?source=next`;
	return fetch(url, {timeout: 2000})
	.then(fetchres.json)
	.then(response => {
		return {
			pixelWidth: response.width,
			pixelHeight: response.height
		};
	})
	.catch((err) => {
		logger.warn({ event: 'IMAGE_DIMENSIONS_FETCH_FAILED', err: err.toString() });
	});
}
