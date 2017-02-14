'use strict';

const LINK_TAG = /<a[^>]*>.*?<\/a>/g;
const LINK_CONTENT = /<a[^>]*>(.*?)<\/a>/;

module.exports = function (xmlContent) {

	xmlContent = xmlContent.replace(LINK_TAG, matchedTag => {
		let quoteMatches = [null, '', null, ''];
		let trailingMatches = '';
		let leadingMatches = '';

		let linkContent = LINK_CONTENT.exec(matchedTag)[1];

		matchedTag = matchedTag.replace(linkContent, matchedContent => {
			// TODO Do we still need to replace these encoded chars?
			let contents = matchedContent
			.replace('&#x2018;', '‘')
			.replace('&#x2019;', '’')
			.replace('&#x201C;', '“')
			.replace('&#x201D;', '”');

			// Move quotes outside of tags
			const quoteReg = /^([“‘]) ?(.*) ?([”’])$/;
			const quotes = quoteReg.exec(contents);
			if (quotes) {
				quoteMatches = quotes;
				contents = quotes[2];
				return contents;
			}

			// Move leading and trailing spaces outside of tags
			const trailingReg = /([ ,.;:]\s*)$/m;
			const leadingReg = /^([ ,.;:]\s*)/m;
			const trailing = trailingReg.exec(contents);
			if (trailing) {
				contents = contents.replace(trailingReg, '');
				trailingMatches = trailing[0];
			}
			const leading = leadingReg.exec(contents);
			if (leading) {
				contents = contents.replace(leadingReg, '');
				leadingMatches = leading[0];
			}
			return contents;
		});

		return (leadingMatches + quoteMatches[1] + matchedTag + quoteMatches[3] + trailingMatches);
	});

	return xmlContent;
};
