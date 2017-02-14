const getImageSize = require('../../lib/get-image-size');

function processImageSize (resource) {
	if (resource && !resource.pixelWidth && !resource.pixelHeight) {
		return getImageSize(resource.binaryUrl).then((imageSize) => {
			imageSize ? Object.assign(resource, imageSize) : resource;
			return resource;
		});
	} else {
		return Promise.resolve(resource);
	}
}

function imageTag (resource) {
	const attrs = [];

	resource.title && attrs.push(`longdesc="${resource.title.replace(/"/g, '&quot;')}"`);
	resource.description && attrs.push(`alt="${resource.description.replace(/"/g, '&quot;')}"`);
	resource.pixelWidth && attrs.push(`width="${resource.pixelWidth}"`);
	resource.pixelHeight && attrs.push(`height="${resource.pixelHeight}"`);
	resource.copyright && resource.copyright.notice && attrs.push(`data-copyright="${resource.copyright.notice}"`);

	return `<img src="${resource.binaryUrl}" ${attrs.join(' ')} />`;
}

module.exports = (resource) => {
	return processImageSize(resource)
		.then(resourceSized => imageTag(resourceSized));
};
