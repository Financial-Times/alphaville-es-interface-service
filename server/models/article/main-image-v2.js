const logger = require('../../lib/logger');
const fetchCapiJson = require('../../lib/fetch-capi-json');
const multiregionImages = require('../../lib/multiregion-images');

module.exports = function (articleV2) {
	if (articleV2.mainImage && articleV2.mainImage.id) {
		return fetchCapiJson(articleV2.mainImage.id)

		.then((imageSet) => (
			// image sets only contain one member ATM
			fetchCapiJson(imageSet.members[0].id)
		))
		.then((image) => ({
			title: image.title,
			description: image.description,
			url: multiregionImages(image.binaryUrl),
			width: image.pixelWidth,
			height: image.pixelHeight,
			ratio: image.pixelWidth && image.pixelHeight ? image.pixelWidth / image.pixelHeight : null
		}))
		.catch((err) => {
			logger.error({
				event: 'MAIN_IMAGE_FETCH_FAIL',
				error: err.toString(),
				uuid: articleV2.mainImage
			});
		});
	}
};
