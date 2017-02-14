module.exports = (resource) => {
	const attrs = [];

	if (resource.webUrl.startsWith('http://video.ft.com/')) {
		attrs.push('data-embedded="true"');
		attrs.push('data-asset-type="video"')
	}

	return `<a href="${resource.webUrl}" ${attrs.join(' ')} />`;
};
