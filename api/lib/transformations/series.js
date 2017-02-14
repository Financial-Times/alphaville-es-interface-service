"use strict";

const Promise = require('bluebird');
const _ = require('lodash');
const formatTitle = require('../utils/formatTitle.js');


const getSeries = (article) => {
	if (article && '_source' in article && 'annotations' in article._source) {
		return article._source.annotations.filter(a => a.directType.indexOf('AlphavilleSeries') !== -1);
	}
	return [];
};

const getArticlesInSeries = (series, config) => {

	const id = series.idV2;
	const signedFetch = config.signedFetch;
	const searchUrl = config.searchUrl;
	const errorHandler = config.handleEsErrorMessage;
	const order = config.resultOrder || 'desc';

	return signedFetch(searchUrl, {
		method: 'POST',
		body: JSON.stringify({
			_source: ['id', 'title', 'webUrl'],
			sort: {
				publishedDate: {
					order: order
				}
			},
			from: 0,
			size: 9999,
			filter: {
				term: {
					"annotations.directType": {
						value: "http://www.ft.com/ontology/AlphavilleSeries"
					},
					"annotations.prefLabel": {
						value : series.prefLabel
					}				
				}
			}
		})
	}).then(res => res.json())
		.then(errorHandler);
};

const createSeriesArticles = (currentId, articles) => {
	return articles
		.filter(a => a._source.id !== currentId)
		.map(a => a._source)
		.filter(item => {item.title = formatTitle(item.title); return true});
};

exports.processArticle = (article, config) => {
	let series = getSeries(article);
	if (!series.length) {
		return Promise.resolve(article);
	}
	const seriesItem = series.shift();

	return getArticlesInSeries(seriesItem, config)
		.then(res => {
			var articles = createSeriesArticles(article._source.id, res.hits.hits);
			if (config.resultSize) {
				articles = articles.splice(0, config.resultSize);
			} 			
			article._source = _.extend(
				{},
				article._source,
				{
					seriesArticles: {
						series: seriesItem,
						articles: articles
					}
				}
			);
			if (config.resultSize) {

			}
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
