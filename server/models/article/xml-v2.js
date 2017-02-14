const trimmedLinks = require('./trimmed-links');

module.exports = (xml) => {
	const body = trimmedLinks(xml
		// Remove new lines
		.replace(/\r?\n|\r/g, '')
		// Remove extraneous whitespace
		.replace(/\s{2,}/g, ' ')
		// Remove spaces between end of links and punctuation
		.replace(/<\/a>\s+([,;.:])/g, '</a>$1')
		// HACK Remove spaces between end of sentence and any empty links
		.replace(/([.>])(\s*)(<a[^>]*><\/a>)/g, '$1$3')
		// Remove empty em tags
		.replace(/<em>\s*<\/em>/g, '')
		// Remove empty b tags
		.replace(/<b>\s*<\/b>/g, '')
		// Remove empty strong tags
		.replace(/<strong>\s*<\/strong>/g, '')
		// Remove empty span tags
		.replace(/<span>\s*<\/span>/g, '')
		// Remove empty paragraphs
		.replace(/<p>\s*<\/p>/g, '')
		// Remove redundant break elements (<p>...</p><br /><p>...</p>)
		.replace(/<\/p>\s*(?:<br\/?>)+\s*<p>/g, '</p><p>')
		// Replace paragraphs with only ... or --- with <hr>
		.replace(/<p>\s*(?:<strong>)?(?:-\s?|\.\s?){3,}(?:<\/strong>)?\s*<\/p>/g, '<hr />')
		// Unwrap
		.replace(/^<body[^>]*>([^]*)<\/body>/m, '$1'));

	if (body.length > 0) {
		return body;
	}
};
