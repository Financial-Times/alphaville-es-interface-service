const filterAnnotations = require('../utils/filterAnnotations');
const categorization = require('../utils/categorization');
const avSeries = require('./series');


function setPrimaryTheme(label, url) {
	return {
		label : label,
		url : url
	};
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		const primaryTheme = [];

		if (article) {
			if (categorization.isFirstFT(article)){
				primaryTheme.push(setPrimaryTheme('First FT', 'https://www.ft.com/firstft'));

			} else if (categorization.isOpeningQuote(article)){
				primaryTheme.push(setPrimaryTheme('FT Opening Quote', `/type/${encodeURIComponent('FT Opening Quote')}`));

			} else if (categorization.isGuestPost(article)){
				primaryTheme.push(setPrimaryTheme('Guest post', `/type/${encodeURIComponent('Guest post')}`));

			} else if (categorization.isSeriesArticle(article)) {
				const seriesLabel = avSeries.getSeries(article).prefLabel;
				if (seriesLabel !== 'Alphachat') {
					primaryTheme.push(setPrimaryTheme('Part of the ' + seriesLabel + ' series', '/series/' + encodeURIComponent(seriesLabel)));
				} else {
					primaryTheme.push(setPrimaryTheme(seriesLabel, '/series/' + seriesLabel));
				}
			} else {
				const topics = filterAnnotations(article.annotations,
					(a => a.type === 'TOPIC' &&
							(a.predicate.split('/').pop() === 'about' ||
								a.predicate.split('/').pop() === 'isClassifiedBy' ||
								a.predicate.split('/').pop() === 'isPrimarilyClassifiedBy')
					));
				const authors = article.authors;

				if (topics.length > 0) {
					for (let i = 0; i < topics.length; i++) {
						primaryTheme.push(setPrimaryTheme(topics[i].prefLabel, '/topic/' + encodeURIComponent(topics[i].prefLabel) ));
					}
				} else if (authors.length > 0){
					for (let i = 0; i < authors.length; i++) {
						primaryTheme.push(setPrimaryTheme(authors[i].name, authors[i].url));
					}
				} else {
					primaryTheme.push(setPrimaryTheme('Markets', '/search?q=Markets'));
				}
			}

			article.primaryTheme = [];
			const themeLabels = [];

			primaryTheme.forEach(theme => {
				if (!themeLabels.includes(theme.label)) {
					themeLabels.push(theme.label);
					article.primaryTheme.push(theme);
				}
			});

		}


		resolve(article);
	});
};
