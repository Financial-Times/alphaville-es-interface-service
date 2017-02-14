'use strict';

const nUrlManagementApiReadClient = require('../../lib/n-url-management-api-read-client');

module.exports = (metadata) => {

	return nUrlManagementApiReadClient.batchGet(metadata.map(tag => tag.url))
		.then(data => data.map((result, index) => {
			let url = result.fromURL;

			// HACK: For simplicity, if we see a 301 we assume that the URL it points to
			// is the one we should consider to be the ‘true’ URL for that stream.
			if (result.code === 301) {
				url = result.toURL;
			}

			// Do some ugly stuff to prevent JavaScript mutating the
			// existing object/ and giving me headaches

			return Object.keys(metadata[index]).reduce((newTag, prop) => {
				newTag[prop] = prop === 'url' ? url : metadata[index][prop];
				return newTag;
			}, {});
		}));

};
