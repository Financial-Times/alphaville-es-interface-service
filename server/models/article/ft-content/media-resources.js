const cheerio = require('cheerio');
const logger = require('../../../lib/logger');
const fetchCapiJson = require('../../../lib/fetch-capi-json');
const transformVideoResource = require('../transform-video-resource');
const transformImageResource = require('../transform-image-resource');

const coco = (url) => (
	// skip API gateway so we don't run into usage limits
	url.replace('http://api.ft.com', `https://${process.env.COCO_API_HOST}`)
);

const fetchMediaResource = (url) => (
	fetchCapiJson(coco(url)).then((data) => {
		if (!data.webUrl && !data.binaryUrl) {
			throw new Error(`No webUrl (video) or binaryUrl (image) for MediaResource ${url}`);
		}

		return data;
	})
);

module.exports = (xml) => {
	const $ = cheerio.load(xml, { decodeEntities: false });
	const $tags = $('ft-content[type="http://www.ft.com/ontology/content/MediaResource"]');

	const resolutions = [];

	$tags.each((i) => {
		const $tag = $tags.eq(i);
		const url = $tag.attr('url');

		const resolution = fetchMediaResource(url)
			.then((resource) => {
				if (resource.binaryUrl) {
					return transformImageResource(resource);
				} else {
					return transformVideoResource(resource);
				}
			})
			.then((replacement) => {
				$tag.replaceWith(replacement);
			})
			.catch((err) => {
				logger.warn(`event=PRERESOLVE_MEDIARESOURCE_FAILED error=${err.toString()}`);
				$tag.replaceWith('');
			});

		resolutions.push(resolution);
	});

	return Promise.all(resolutions).then(() => $.html());
};
