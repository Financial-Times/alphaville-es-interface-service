const companyLinks = require('./company-links');
const contentLinks = require('./content-links');
const imageSets = require('./image-sets');
const mediaResources = require('./media-resources');

module.exports = function (xml) {
	return Promise.resolve(xml)
		.then(companyLinks)
		.then(contentLinks)
		.then(imageSets)
		.then(mediaResources);
};
