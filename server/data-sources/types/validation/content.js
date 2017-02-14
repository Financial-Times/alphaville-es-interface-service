module.exports = content => {
	const issues = [];

	// All content must have a valid UUID
	const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
	if (!content.id || !uuid.test(content.id)) {
		issues.push('Invalid ID');
	}

	// All content must have a valid date
	if (!content.publishedDate || isNaN(Date.parse(content.publishedDate))) {
		issues.push('Invalid date');
	}

	// All content must have main body content
	const empty = /^\s+$/;
	if (!content.bodyHTML || empty.test(content.bodyHTML)) {
		issues.push('No content');
	}

	// All content must have _some_ tags
	if (content.metadata.length === 0) {
		issues.push('No TME tags');
	}

	if (issues.length) {
		throw new Error(issues.join());
	}

	return issues;
};
