const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const empty = /^\s+$/;

// const ftcontent = /\<\/?ft-content/;

module.exports = (content) => {

	const issues = [];

	// All content must have a valid UUID
	if (!content.id || !uuid.test(content.id)) {
		issues.push(new Error('Invalid ID'));
	}

	// All content must have a valid date
	if (!content.publishedDate || isNaN(Date.parse(content.publishedDate))) {
		issues.push(new Error('Invalid date'));
	}

	// All content must have main body content
	if (!content.bodyHTML || empty.test(content.bodyHTML)) {
		issues.push(new Error('No content'));
	}

	// All content must have _some_ tags
	if (content.metadata.length === 0) {
		issues.push(new Error('No TME tags'));
	}

	// Content must not have any unresolved <ft-content> elements
	// const shocking = [ 'openingXML', 'openingHTML', 'bodyXML', 'bodyHTML' ].some(
	//	(item) => content[item] && ftcontent.test(content[item])
	// );

	// if (shocking) {
	//	issues.push(new Error('Unresolved <ft-content>'));
	// }

	return issues;
};
