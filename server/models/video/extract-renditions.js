module.exports = (renditions = []) => (
	renditions
		.filter((rendition) => 'src' in rendition && rendition.container.toLowerCase() === 'mp4')
		// NOTE: Brightcove _seems_ to return duplicates
		.reduce((unique, rendition) => {
			if (!unique.some(storedRendition => storedRendition.asset_id === rendition.asset_id)) {
				unique.push(rendition);
			}

			return unique;
		}, [])
		.map((rendition) => ({
			mediaType: 'video/mp4',
			url: rendition.src,
			width: rendition.width,
			height: rendition.height,
			duration: rendition.duration,
			encodingRate: rendition.encoding_rate,
			codec: rendition.codec
		}))
);
