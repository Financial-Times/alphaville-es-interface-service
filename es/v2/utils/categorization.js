const filterAnnotations = require('./filterAnnotations');

function getTitle(article) {
	return !article ? '' : (('originalTitle' in article) ? article.originalTitle : article.title);
}

exports.isMarketsLive = function (article) {
	if (article) {
		if ('isMarketsLive' in article && article.isMarketsLive === true) {
			return true;
		} else if (article && article.webUrl && article.webUrl.indexOf('marketslive') !== -1) {
			return true;
		}
	}
	return false;
};

exports.isGuestPost = function (article) {
	let isGuestPost = false;
	const title = getTitle(article);
	if (article) {
		if (article.isGuestPost === true) {
			isGuestPost = true;
		} else if (title.indexOf('Guest post:') !== -1 || article.byline === 'Guest writer') {
			isGuestPost = true;
		}
	}
	return isGuestPost;
};

exports.isFirstFT = function (article) {
	let isFirstFT = false;

	if (article) {
		if (article.isFirstFT === true) {
			isFirstFT = true;
		} else if (filterAnnotations(article.annotations, { prefLabel: 'First FT' }).length > 0) {
			isFirstFT = true;
		}
	}
	return isFirstFT;
};



exports.isPodcast = function(article){
	let isPodcast = false;
	const title = getTitle(article);
	if (article) {
		if (article.isPodcast === true) {
			isPodcast = true;
		} else if (title.indexOf('Podcast:') !== -1 || title.indexOf('Alphachat:') !== -1) {
			isPodcast = true;
		}
	}
	return isPodcast;
};

exports.isOpeningQuote = function (article) {
	let isOpeningQuote = false;
	const title = getTitle(article);
	if (article) {
		if (article.isOpeningQuote === true) {
			isOpeningQuote = true;
		} else if (title.indexOf('FT Opening Quote') !== -1 || title.indexOf('Opening Quote') !== -1 ) {
			isOpeningQuote = true;
		}
	}
	return isOpeningQuote;
};

exports.isFurtherReading = function (article) {
	let isFurtherReading = false;
	const title = getTitle(article);
	if (article) {
		if (article.isFurtherReading === true) {
			isFurtherReading = true;
		} else if (title.indexOf('Further reading') !== -1) {
			isFurtherReading = true;
		}
	}
	return isFurtherReading;
};

exports.isSeriesArticle = function (article) {
	let isSeriesArticle = false;
	if (article) {
		if (article.isSeriesArticle) {
			isSeriesArticle = true;
		} else if (filterAnnotations(article.annotations, {directType:'http://www.ft.com/ontology/AlphavilleSeries'}).length > 0) {
			isSeriesArticle = true;
		}
	}
	return isSeriesArticle;
};


