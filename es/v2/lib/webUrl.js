"use strict";
const moment = require('moment-timezone');

function getArticleUrl (articleSource) {
	if (articleSource && articleSource.webUrl && articleSource.webUrl.indexOf('ftalphaville.ft.com') > -1) {
		if (articleSource.webUrl.indexOf('marketslive') === -1) {
			let mlDate = moment(articleSource.firstPublishedDate).format('YYYY-MM-DD');
			articleSource.webUrl = `http://ftalphaville.ft.com/marketslive/${mlDate}/`;
		}
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
