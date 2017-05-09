"use strict";

function getArticleUrl (articleSource) {
	if (articleSource && articleSource.webUrl && articleSource.webUrl.indexOf('ftalphaville.ft.com') > -1) {
		return articleSource.webUrl.replace(/http(s?)\:\/\/ftalphaville.ft.com/, '');
	} else if (articleSource.webUrl) {
		return articleSource.webUrl;
	} else {
		return "";
	}
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article) {
			article.av2WebUrl = getArticleUrl(article);
		}

		resolve(article);
	});
};
