module.exports = (metadata = {}) => {
	if ('poster' in metadata.images) {
		return {
			title: `Video still for ${metadata.name}`,
			description: '',
			url: metadata.images.poster.src,
			width: 640,
			height: 360,
			ratio: 640 / 360
		}
	}
};
