const url = require('url');
const _ = require('lodash');

exports.getUrl = (imgUrl) => {
	const parsedImgUrl = url.parse(imgUrl, true);

	// transform image service v1 URLs to v2
	if (parsedImgUrl.host === 'image.webservices.ft.com') {
		const pathname = parsedImgUrl.pathname.replace('v1', 'v2');
		return `https://www.ft.com/__origami/service/image${pathname}?source=Alphaville`;
	}

	if (!parsedImgUrl.pathname.startsWith('/__origami/service/image')) {
		return `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(imgUrl)}?source=Alphaville`;
	}

	parsedImgUrl.query = _.extend({}, parsedImgUrl.query, {source: 'Alphaville'});
	parsedImgUrl.search = undefined;
	return url.format(parsedImgUrl);
};
