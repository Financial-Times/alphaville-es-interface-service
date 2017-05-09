exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article) {
			if (!article.bodyHTML) {
				article.bodyHTML = article.bodyXML;
			}
		}

		resolve(article);
	});
};
