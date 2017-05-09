"use strict";

const Promise = require('bluebird');
const _ = require('lodash');
const nEsClient = require('@financial-times/n-es-client');

const formatTitle = require('../utils/formatTitle.js');


const getSeries = (article) => {
	if (article && 'annotations' in article) {
		return article.annotations.filter(a => a.directType.indexOf('AlphavilleSeries') !== -1);
	}
	return [];
};

const getArticlesInSeries = (series, config) => {
	const order = config.resultOrder || 'desc';

	return nEsClient.search({
		_source: ['id', 'title', 'webUrl'],
		sort: {
			publishedDate: {
				order: order
			}
		},
		from: 0,
		size: 9999,
		query: {
			bool: {
				must: [
					{
						"nested": {
							"path": "annotations",
							"query": {
								"bool": {
									"must": [
										{ "term": { "annotations.directType": "http://www.ft.com/ontology/AlphavilleSeries" } },
										{ "term": { "annotations.prefLabel": series.prefLabel } }
									]
								}
							}
						}
					}
				]
			}
		}
	});
};

const createSeriesArticles = (currentId, articles) => {
	return articles
		.filter(a => a.id !== currentId)
		.filter(item => {item.title = formatTitle(item.title); return true;});
};

exports.processArticle = (article, config) => {
	const series = getSeries(article);
	if (!series.length) {
		return Promise.resolve(article);
	}
	const seriesItem = series.shift();

	return getArticlesInSeries(seriesItem, config)
		.then(res => {
			let articles = createSeriesArticles(article.id, res);
			if (config.resultSize) {
				articles = articles.splice(0, config.resultSize);
			}
			article = _.extend(
				article,
				{
					seriesArticles: {
						series: seriesItem,
						articles: articles
					}
				}
			);
			return Promise.resolve(article);
		})
		.catch(console.log);
};

exports.getSeries = function (article, prefLabel) {
  	let seriesArticles = getSeries(article);
	seriesArticles = (seriesArticles.length===0) ? false : seriesArticles[0];

	if (seriesArticles) {
		if (seriesArticles.prefLabel === prefLabel) {
			return seriesArticles;
		} else if (typeof prefLabel === 'undefined') {
			return seriesArticles;
		}
	}

	return false;
};
