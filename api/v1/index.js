const _ = require('lodash');
const router = require('express').Router();
const es = require('alphaville-es-interface');
const suds = require('../../services/suds');
const fastly = require('../../services/fastly');
const contentApi = require('../../services/content');

const vanityRegex = /^\/article\/+([0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/?.*)$/;
const uuidRegex = /^\/article\/+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const mlVanityRegex = /(^\/marketslive\/+[0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?\/?)$/;
const mlUuidRegex = /^\/marketslive\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

const articleCache = 300;
const mlCacheShort = 60;
const mlCacheLong = 3600;
const indexStreamCache = 60;
const searchStreamCache = 60;
const authorStreamCache = 60;
const mlStreamCache = 60;
const hotStreamCache = 600;


const setCache = (res, value) => {
	if (process.env.NODE_ENV === 'production') {
		if (value > 0) {
			res.set('Cache-Control', 'public, max-age=' + value);
		} else {
			setNoCache(res);
		}
	} else {
		setNoCache(res);
	}
};

const setNoCache = (res) => {
	res.set('Cache-Control', 'private, no-cache, no-store');
};

const sanitizeParam = (param) => {
	return param.replace(/^\/+|\/+$/g, '');
};

const sanitizeSearchString = (str) => {
	return _.trim(str.replace(/\s*[":><=+|\-()]+\s*/g, ' '));
};

const getEsQueryForArticles = (req) => {
	const offset = parseInt(req.query.offset, 10) || 0;
	const limit = parseInt(req.query.limit, 10) || 30;
	return {
		sort: {
			publishedDate: {
				order: 'desc'
			}
		},
		from: offset,
		size: limit
	};
};

router.use((req, res, next) => {
	if (process.env['API_KEY'] === req.get('X-API-KEY')) {
		return next();
	}
	res.sendStatus(401);
});

router.get('/series/:id', (req, res, next) => {
	const seriesId = req.params.id;
	let esQuery = getEsQueryForArticles(req);
	const seriesQuery = {
		filter: {
			term: {
				"annotations.idV2": {
					value: seriesId
				}
			}
		}
	};
	esQuery = _.merge(esQuery, seriesQuery);
	es.searchArticles(esQuery)
		.then(articles => {
			setCache(res, searchStreamCache);
			res.json(articles);
		})
		.catch(next);
});

//articles
router.get('/articles', (req, res, next) => {
	let esQuery = getEsQueryForArticles(req);
	let searchString = req.query.q || null;
	let sanitizedSearchString = null;

	if (searchString) {
		sanitizedSearchString = sanitizeSearchString(searchString);
	}

	if (!sanitizedSearchString) {
		es.searchArticles(esQuery)
			.then(articles => {
				setCache(res, indexStreamCache);
				res.json(articles);
			})
			.catch(next);
	} else {
		if (sanitizedSearchString.length > process.env['SEARCH_MAX_LENGTH']) {
			return res.json({
				hits: {
					hits: []
				}
			})
		}
		const offset = parseInt(req.query.offset, 10) || 0;
		const limit = parseInt(req.query.limit, 10) || 30;
		let indexCount = 0;
		contentApi.search(sanitizedSearchString, limit, offset)
			.then(articles => {
				if (parseInt(articles.results[0].indexCount, 10)) {
					indexCount = articles.results[0].indexCount;
					return articles.results[0].results.map(a => a.id);
	 			}
			})
			.then(articlesIds => {
				if (articlesIds) {
					esQuery = {
						query: {
							ids: {
								values: articlesIds
							}
						},
						size: limit,
						sort: {
							publishedDate: {
								order: 'desc'
							}
						}
					};
					return es.searchArticles(esQuery);
				}
			})
			.then(articles => {
				if (articles) {
					setCache(res, searchStreamCache);
					articles.hits.total = indexCount;
					res.json(articles);
				} else {
					res.json({
						hits: {
							hits: []
						}
					})
				}
			})
			.catch(console.log);
	}
});

const handleVanityArticle = (req, res, next) => {
	const urlToSearch = `*://ftalphaville.ft.com/${sanitizeParam(req.params[0])}/`;
	return es.getArticleByUrl(urlToSearch)
		.then(article => {
			if (article.isMarketsLive) {
				if (article.isLive) {
					setNoCache(res);
				} else {
					const today = new Date();
					const publishedDate = new Date(article._source.publishedDate);

					if (publishedDate.getUTCFullYear() === today.getUTCFullYear()
							&& publishedDate.getUTCMonth() === today.getUTCMonth()
							&& publishedDate.getUTCDate() === today.getUTCDate()) {
						// on the day of publishing apply short cache
						setCache(res, mlCacheShort);
					} else {
						setCache(res, mlCacheLong);
					}
				}
			} else {
				setCache(res, articleCache);
			}

			res.json(article);
		})
		.catch(next);
};

const handleUuidArticle = (req, res, next) => {
	return es.getArticleByUuid(req.params[0])
		.then(article => {
			if (article.isMarketsLive) {
				if (article.isLive) {
					setNoCache(res);
				} else {
					const today = new Date();
					const publishedDate = new Date(article._source.publishedDate);

					if (publishedDate.getUTCFullYear() === today.getUTCFullYear()
							&& publishedDate.getUTCMonth() === today.getUTCMonth()
							&& publishedDate.getUTCDate() === today.getUTCDate()) {
						// on the day of publishing apply short cache
						setCache(res, mlCacheShort);
					} else {
						setCache(res, mlCacheLong);
					}
				}
			} else {
				setCache(res, articleCache);
			}

			res.json(article);
		})
		.catch(next);
};

//article
router.get(vanityRegex, handleVanityArticle);
router.get(uuidRegex, handleUuidArticle);

//author
router.get('/author', (req, res, next) => {
	const authorString = req.query.q || null;
	let esQuery = getEsQueryForArticles(req);
	if (authorString) {
		const authorQuery = {
			query: {
				wildcard : {
					byline: `*${authorString}*`
				}
			}
		};
		esQuery = _.merge(esQuery, authorQuery);
	}
	es.searchArticles(esQuery)
		.then(articles => {
			setCache(res, authorStreamCache);

			res.json(articles);
		})
		.catch(next);
});

//marketslive
router.get('/marketslive', (req, res, next) => {
	const mlQuery = {
		filter: {
			and: {
				filters: [
					{
						term: {
							"metadata.primary": {
								value: "section"
							},
							"metadata.idV1": {
								value: "NzE=-U2VjdGlvbnM=" // Markets
							}
						}
					},
					{
						regexp: {
							webUrl: {
								value: "(.*)marketslive(.*)"
							}
						}
					}
				]
			}
		}
	};
	const esQuery = _.merge(getEsQueryForArticles(req), mlQuery);
	es.searchArticles(esQuery)
		.then(articles => {
			if (articles && articles.hits && articles.hits.hits) {
				let isLive = false;
				articles.hits.hits.forEach(article => {
					if (article.isLive) {
						isLive = true;
					}
				});

				if (!isLive) {
					setCache(res, mlStreamCache);
				} else {
					setNoCache(res);
				}

				res.json(articles);
			} else {
				res.json({
					hits: {
						hits: []
					}
				});
			}
		})
		.catch(next);
});

router.get(mlVanityRegex, handleVanityArticle);
router.get(mlUuidRegex, handleUuidArticle);

router.get('/hotarticles', (req, res, next) => {
	let limit = 30;
	if (req.query.limit) {
		limit = parseInt(req.query.limit, 10);

		if (limit > 90) {
			limit = 90;
		}
	}

	return suds.getHotArticles({
		tag: [
			'brand.FT_Alphaville',
			'brand.First_FT'
		],
		op: 'or',
		number: limit + 10
	}).then(results => {
		setCache(res, hotStreamCache);

		const articles = results
			.filter(a => a.url.indexOf('marketslive') === -1);

		const articleIds = articles.map(a => a.articleId);

		return es.searchArticles({
			query: {
				ids: {
					values: articleIds
				}
			},
			size: limit
		}).then(articles => {
			if (articles && articles.hits && articles.hits.hits) {
				const sortedResult = [];
				articles.hits.hits.forEach((article) => {
					if (articleIds.indexOf(article._id) >= 0) {
						sortedResult[articleIds.indexOf(article._id)] = article;
					}
				});

				articles.hits.hits = sortedResult.filter(a => a !== null);

				res.json(articles);
			} else {
				res.json({
					hits: {
						hits: []
					}
				});
			}
		});
	}).catch(next);
});

router.post('/purge', (req, res, next) => {
	const url = req.body.url;
	if (url) {
		return fastly.purge(url).then(obj => {
			res.json(obj);
		}).catch(next);
	}
	return next('No path to purge provided');
});

module.exports = router;
