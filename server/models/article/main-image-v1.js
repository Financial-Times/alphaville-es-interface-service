module.exports = function (articleV1) {
	const image = Array.isArray(articleV1.item.images)
		&& articleV1.item.images.filter((image) => image.type === 'wide-format').shift();

	if (image) {
		return {
			title: image.alt,
			description: image.alt,
			url: image.url,
			width: image.width,
			height: image.height,
			ratio: image.width && image.height ? image.width / image.height : null
		};
	}
};
