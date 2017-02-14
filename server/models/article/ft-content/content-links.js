const cheerio = require('cheerio');

module.exports = (xml) => {
	const $ = cheerio.load(xml, { decodeEntities: false });
	const $links = $('ft-content[type="http://www.ft.com/ontology/content/Article"]');

	$links.each((i) => {
		const $link = $links.eq(i);
		const url = $link.attr('url').replace('http://api.ft.com', '').trim();

		$link.replaceWith(`<a href="${url}">${$link.text()}</a>`);
	});

	// This doesn't need to be a promise, it's just for consistency
	return Promise.resolve($.html());
};
