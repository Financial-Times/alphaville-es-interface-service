const Type = require('./type');

class PlaceholderType extends Type {
	static match ({ capiV1, capiV2 }) {
		if (!capiV2) return false;

		const isOnlyInCapiV2 = !capiV1 && capiV2;
		const hasBody = capiV2.bodyXML;
		const isContent = capiV2.types.find(type => type === 'http://www.ft.com/ontology/content/Content');
		const isArticle = capiV2.types.find(type => type === 'http://www.ft.com/ontology/content/Article');

		return isOnlyInCapiV2 && !hasBody && isContent && !isArticle;
	}

	static get model () {
		return require('../../models/placeholder');
	}

	static check (content) {
		const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
		let issues = [];

		if (!content.id || !uuid.test(content.id)) {
			issues.push('Invalid ID');
		}

		if (!content.publishedDate || isNaN(Date.parse(content.publishedDate))) {
			issues.push('Invalid date');
		}

		if (content.metadata.length === 0) {
			issues.push('No TME tags');
		}

		if (issues.length) {
			throw new Error(issues.join());
		}

		return content;
	}

	data () {
		// We don't need to fetch further data
		return Promise.resolve(this.initialData);
	}
}

module.exports = PlaceholderType;
