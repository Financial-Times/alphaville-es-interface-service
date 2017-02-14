const logger = require('../../lib/logger');
const fetchCapiJson = require('../../lib/fetch-capi-json');
const multiregionImages = require('../../lib/multiregion-images');

module.exports = (imageId) => {

	if (imageId) {
		return fetchCapiJson(imageId)

		.then((image) => ({
			url: multiregionImages(image.binaryUrl),
			width: image.pixelWidth,
			height: image.pixelHeight,
			ratio: image.pixelWidth && image.pixelHeight ? image.pixelWidth / image.pixelHeight : null
		}))

		.catch((err) => {
			logger.error({
				event: 'MAIN_IMAGE_FETCH_FAIL',
				error: err.toString(),
				uuid: imageId
			});
		})
	}

};
