const filterMetadata = require('../utils/filterMetadata');
const categorization = require('../utils/categorization');
const avSeries = require('./series');


function setPrimaryTheme(label, url) {
	return {
		label : label,
		url : url
	}
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		let primaryTheme = [];
		if (article._source) {
			if (categorization.isMarketsLive(article)) {
				primaryTheme.push(setPrimaryTheme('Markets Live', '/marketslive'));

			} else if (categorization.isFirstFT(article)){
				primaryTheme.push(setPrimaryTheme('First FT', 'https://www.ft.com/firstft'));

			} else if (categorization.isOpeningQuote(article)){
				primaryTheme.push(setPrimaryTheme('FT Opening Quote', `/type/${encodeURIComponent('FT Opening Quote')}`));

			} else if (categorization.isGuestPost(article)){
				primaryTheme.push(setPrimaryTheme('Guest post', `/type/${encodeURIComponent('Guest post')}`));

			} else if (categorization.isSeriesArticle(article)) {
				let seriesLabel = avSeries.getSeries(article).prefLabel;
				if (seriesLabel !== 'Alphachat') {
					primaryTheme.push(setPrimaryTheme('Part of the ' + seriesLabel + ' series', '/series/' + encodeURIComponent(seriesLabel)));
				} else {
					primaryTheme.push(setPrimaryTheme(seriesLabel, '/series/' + seriesLabel));
				}
			} else {
				let topics = filterMetadata(article._source.annotations, {directType: 'http://www.ft.com/ontology/Topic'});
				let sections = filterMetadata(article._source.annotations, {directType: 'http://www.ft.com/ontology/Topic'});
				let authors = article._source.authors;

				if (topics.length > 0) {
					for (var i = 0; i < topics.length; i++) {
						primaryTheme.push(setPrimaryTheme(topics[i].prefLabel, '/topic/' + encodeURIComponent(topics[i].prefLabel) ));
					}
				} else if (authors.length > 0){
					for (var i = 0; i < authors.length; i++) {
						primaryTheme.push(setPrimaryTheme(authors[i].name, authors[i].url));
					}
				} else {
					primaryTheme.push(setPrimaryTheme('Markets', '/search?q=Markets'));
				}
			}

			article._source.primaryTheme = primaryTheme;

		}


		resolve(article);
	});
};
