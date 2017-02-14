module.exports = (body) => (
	body
		// Remove new lines
		.replace(/\r?\n|\r/g, '')
		// Remove extraneous whitespace
		.replace(/\s{2,}/g, ' ')
		// Remove all tags except paragraphs
		.replace(/<(?!\s*\/?\s*p\b)[^>]*>/gi, '')
		// Remove any empty paragraphs
		.replace(/<p>\s*<\/p>/g, '')
);
