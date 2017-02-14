const elasticSearchUrl = process.env.ELASTIC_SEARCH_HOST;

const WpApi = require('alphaville-marketslive-wordpress-api');
WpApi.setBaseUrl(process.env.WP_URL);
const _ = require('lodash');

const index = 'content';
const signedFetch = require('signed-aws-es-fetch');
const images = require('./transformations/images');
const summaries = require('./transformations/summaries');
const authors = require('./transformations/authors');
const marketslive = require('./transformations/marketslive');
const primaryTheme = require('./transformations/primaryTheme');
const bodyHTML = require('./transformations/bodyHTML');
const embed = require('./transformations/embed');
const webUrl = require('./transformations/webUrl');
const title = require('./transformations/title');

const avSeries = require('./transformations/series');
const categorization = require('./transformations/categorization');
const searchUrl = `https://${elasticSearchUrl}/${index}/_search`;

const seriesConfig = {
	signedFetch,
	searchUrl,
	handleEsErrorMessage
};

function processArticles(response) {
	const transformPromises = [];

	if (!response.hits || !response.hits.hits.length) {
		return Promise.resolve({
			hits: {
				hits: []
			}
		});
	}

	response.hits.hits.forEach((article) => {
		transformPromises.push(Promise.all([
			categorization.processArticle(article),
			avSeries.processArticle(article, _.extend({resultSize:10}, seriesConfig)),
			webUrl.processArticle(article),
			bodyHTML.processArticle(article)
				.then(images.processArticle)
				.then(marketslive.processArticle)
				.then(summaries.processArticle),
			authors.processArticle(article),
			primaryTheme.processArticle(article),
			title.processArticle(article)
		]));
	});

	return Promise.all(transformPromises).then(() => {
		return response;
	});
}

function handleEsErrorMessage (json) {
	if (json && json.message && !json._source && !json.hits) {
		throw new Error(json.message);
	}

	return json;
}

function normalizeSearchResponse (response) {
	if (!response) {
		response = {
			hits: {
				hits: []
			}
		};
	}

	return response;
}

const defaultFilter = {
	and: {
		filters: [
			{
				or: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
							}
						}
					},{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "N2NkMjJiYzQtOGI3MC00NTM4LTgzYmYtMTQ3YmJkZGZkODJj-QnJhbmRz" // First FT
							}
						}
					}]
				}
			},
			{
				bool: {
					must_not: {
						regexp: {
							webUrl: {
								value: "(.*)acast.com(.*)"
							}
						}
					}
				}
			}
		]
	}
};

function getAlphavilleEsQuery (query) {
	query = query || {};

	if (query.filter) {
		query.filter = {
			and: {
				filters: [
					defaultFilter,
					query.filter
				]
			}
		};
	} else {
		query.filter = defaultFilter;
	}

	return query;
}

module.exports = {
	searchArticles: function(query) {
		return signedFetch(searchUrl, {
				method: 'POST',
				body: JSON.stringify(getAlphavilleEsQuery(query))
			})
			.then(response => response.json())
			.then(handleEsErrorMessage)
			.then(processArticles);
	},
	getArticleByUuid: function (uuid) {

		return signedFetch(`https://${elasticSearchUrl}/${index}/item/${uuid}`)
			.then(response => response.json())
			.then(handleEsErrorMessage)
			.then(normalizeSearchResponse)
			.then(article => {
				if (article) {

					return Promise.all([
						categorization.processArticle(article),
						avSeries.processArticle(article, _.extend({resultOrder:'asc'}, seriesConfig)),
						webUrl.processArticle(article),
						bodyHTML.processArticle(article)
							.then(images.processArticle)
							.then(embed.processArticle)
							.then(article => marketslive.processArticle(article, true))
							.then(summaries.processArticle),
						authors.processArticle(article),
						primaryTheme.processArticle(article),
						title.processArticle(article)
					]).then(() => article);
				} else {
					return article;
				}
			});
	},
	getArticleByUrl: function (url) {

		return signedFetch(searchUrl, {
				method: 'POST',
				body: JSON.stringify(getAlphavilleEsQuery({
					query: {
						wildcard: {
							webUrl: url
						}
					},
					size: 1
				}))
			})
			.then(response => response.json())
			.then(handleEsErrorMessage)
			.then((res) => {
				if (!res.hits || !res.hits.hits.length) {
					return {
						found: false
					};
				}

				return res.hits.hits[0];
			})
			.then(article => {
				if (article) {
					return Promise.all([
						categorization.processArticle(article),
						avSeries.processArticle(article, _.extend({resultOrder:'asc'}, seriesConfig)),
						webUrl.processArticle(article),
						bodyHTML.processArticle(article)
							.then(images.processArticle)
							.then(embed.processArticle)
							.then(article => marketslive.processArticle(article, true))
							.then(summaries.processArticle),
						authors.processArticle(article),
						primaryTheme.processArticle(article),
						title.processArticle(article)
					]).then(() => article);
				} else {
					return article;
				}
			});
	}
};
