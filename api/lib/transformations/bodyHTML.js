exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article._source) {
			if (!article._source.bodyHTML) {
				article._source.bodyHTML = article._source.bodyXML;
			}
		}

		resolve(article);
	});
};
