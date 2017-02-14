const getImageSize = require('../lib/get-image-size');
const podcastMetadata = require('./podcast/metadata');
const displayTags = require('./article/metadata/display-tags');
const primaryTags = require('./article/metadata/primary-tags');
const remodelTags = require('./article/metadata/remodel');
const { decode } = require('he');

module.exports = function (data, feedMetadata) {
	const tags = podcastMetadata(feedMetadata.masterSource);
	const date = new Date(data.pubdate).toISOString();
	const guid = data.guid.text.trim();
	const image = data['itunes:image'].href || feedMetadata.defaultImage;

	// transform metadata
	const transforms = [ primaryTags, displayTags, remodelTags ];

	const metadata = transforms.reduce((tags, transform) => transform(tags), tags);

	// we're reading from XML so some characters will be encoded
	const decoded = decode(data.description.trim());
	const body = '<p>' + decoded.replace(/\n\n/g, '</p><p>') + '</p>';

	return getImageSize(image)
		.then((response) => ({
			type: 'podcast',
			id: guid,
			title: decode(data.title.trim()),
			alternativeTitles: {},
			titles: [],
			bodyXML: body,
			bodyHTML: body,
			summaries: [
				// Some descriptions have links in so strip any markup out
				data.description.trim().split(/\n\n/)[0].replace(/<(?:.|\n)*?>/g, '')
			],
			subheading: data.description.trim().split(/\n\n/)[0].replace(/<(?:.|\n)*?>/g, ''),
			byline: feedMetadata.byline.trim().split(/\n\n/)[0],
			publishedDate: date,
			webUrl: data.link,
			provenance: [
				feedMetadata.masterSource
			],
			attachments: [
				{
					mediaType: data.enclosure.type,
					url: data.enclosure.url
				}
			],
			mainImage: {
				title: `Logo for ${feedMetadata.title} podcast`,
				description: '',
				url: image,
				width: response && response.pixelWidth,
				height: response && response.pixelHeight,
				ratio: response && response.pixelWidth && response.pixelWidth ?
								response.pixelWidth / response.pixelHeight :
								null
			},
			metadata,
			_lastUpdatedDateTime: new Date().toISOString()
		}));
};
