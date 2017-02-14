"use strict";

function getArticleUrl (articleSource) {
	if (articleSource.webUrl.indexOf('ftalphaville.ft.com') > -1) {
		return articleSource.webUrl.replace(/http(s?)\:\/\/ftalphaville.ft.com/, '');
	} else {
		return articleSource.webUrl;
	}
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article._source) {
			article._source.av2WebUrl = getArticleUrl(article._source);
		}

		resolve(article);
	});
};
