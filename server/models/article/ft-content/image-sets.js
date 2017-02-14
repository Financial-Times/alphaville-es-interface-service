const cheerio = require('cheerio');
const logger = require('../../../lib/logger');
const fetchCapiJson = require('../../../lib/fetch-capi-json');
const transformImageResource = require('../transform-image-resource');

const coco = (url) => (
	// skip API gateway so we don't run into usage limits
	url.replace('http://api.ft.com', `https://${process.env.COCO_API_HOST}`)
);

const fetchImage = (url) => (
	fetchCapiJson(coco(url)).then((data) => {
		if (!data.members || !data.members.length) {
			throw new Error(`No image data found for ${url}`);
		}

		// Image sets only contain one media resource member
		return fetchCapiJson(coco(data.members[0].id));
	})
);

module.exports = (xml) => {
	const $ = cheerio.load(xml, { decodeEntities: false });
	const $tags = $('ft-content[type="http://www.ft.com/ontology/content/ImageSet"]');

	const resolutions = [];

	$tags.each((i) => {
		const $tag = $tags.eq(i);
		const url = $tag.attr('url');

		const resolution = fetchImage(url)
			.then(transformImageResource)
			.then((replacement) => {
				$tag.replaceWith(replacement);
			})
			.catch((err) => {
				logger.warn(`event=PRERESOLVE_IMAGESET_FAILED error=${err.toString()}`);
				$tag.replaceWith('');
			});

		resolutions.push(resolution);
	});

	return Promise.all(resolutions).then(() => $.html());
};
