const Type = require('./type');
const validateContent = require('./validation/content');

const UUID = /(?:^|\/)\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

const isCapiV1 = (content) => (
	content && content.item && UUID.test(content.item.id)
);

const isFastFT = (content) => (
	content && content.types && content.types.find(type => type === 'http://www.ft.com/ontology/content/Article') && content.webUrl && content.webUrl.includes('ft.com/fastft')
);

class ArticleType extends Type {
	static match ({ capiV1, capiV2 }) {
		return isCapiV1(capiV1) || isFastFT(capiV2);
	}

	static get model () {
		return require('../../models/article');
	}

	static check (content) {
		const issues = validateContent(content);
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

module.exports = ArticleType;
