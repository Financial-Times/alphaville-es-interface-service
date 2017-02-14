'use strict';

const nUrlManagementApiReadClient = require('../../lib/n-url-management-api-read-client');

module.exports = (id, webUrl) => {

	// If it's an FTAlphaville article, set the URL to be the URL on the
	// separate site. This is because for internal reasons FTAlphaville
	// is a separate website and should never render on Next FT.
	if (/http:\/\/ftalphaville/.test(webUrl)) {
		return Promise.resolve(webUrl);
	}

	const fromURL = `https://www.ft.com/content/${id}`;

	return nUrlManagementApiReadClient.get(fromURL)
		.then(result => {
			// HACK: For simplicity, if we see a 301 we assume that the URL it points to
			// is the one we should consider to be the ‘true’ URL for that article.
			// This is better than the vanity for an article because this will soon include
			// URLs that are off the FT.com domain name (interactive graphics, etc)
			if (result.code === 301) {
				return result.toURL;
			}
			return fromURL;
		});
};
