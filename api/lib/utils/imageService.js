exports.getUrl = function (url) {
	if (url.indexOf('image.webservices.ft.com/v1/images/raw') === -1) {
		return 'https://image.webservices.ft.com/v1/images/raw/' + encodeURIComponent(url) + '?source=Alphaville';
	} else {
		const matches = url.match('https://image.webservices.ft.com/v1/images/raw/([^?]+)(.*)');
		if (matches && matches.length) {
			const src = decodeURIComponent(matches[1]);

			return 'https://image.webservices.ft.com/v1/images/raw/' + encodeURIComponent(src) + '?source=Alphaville';
		} else {
			return url;
		}
	}
};
