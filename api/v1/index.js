const _ = require('lodash');
const router = require('express').Router();
const es = require('alphaville-es-interface');
const suds = require('../../services/suds');

const vanityRegex = /^\/article\/+([0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/?.*)$/;
const uuidRegex = /^\/article\/+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const mlVanityRegex = /(^\/marketslive\/+[0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?\/?)$/;
const mlUuidRegex = /^\/marketslive\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

const articleCache = 300;
const mlCache = 3600;
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

//articles
router.get('/articles', (req, res, next) => {
	const searchString = req.query.q || null;
	let esQuery = getEsQueryForArticles(req);

	if (searchString) {
		const searchQuery = {
			query: {
				multi_match: {
					query: searchString,
					fields: ["titles", "byline"]
				}
			}
		};
		esQuery = _.merge(esQuery, searchQuery);
	}

	es.searchArticles(esQuery)
		.then(articles => {
			if (!searchString) {
				setCache(res, indexStreamCache);
			} else {
				setCache(res, searchStreamCache);
			}

			res.json(articles);
		})
		.catch(next);
});

const handleVanityArticle = (req, res, next) => {
	const urlToSearch = `*://ftalphaville.ft.com/${sanitizeParam(req.params[0])}/`;
	return es.getArticleByUrl(urlToSearch)
		.then(article => {
			if (article.isMarketsLive) {
				if (article.isLive || new Date().getTime() - new Date(article.publishedDate).getTime() < 6 * 60 * 60 * 1000) {
					setNoCache(res);
				} else {
					setCache(res, mlCache);
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
				if (article.isLive || new Date().getTime() - new Date(article.publishedDate).getTime() < 6 * 60 * 60 * 1000) {
					setNoCache(res);
				} else {
					setCache(res, mlCache);
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
		limit = parseInt(req.query.limit);

		if (limit > 90) {
			limit = 90;
		}
	}

	suds.getHotArticles({
		tag: 'alphaville',
		number: limit + 10
	}).then(results => {
		setCache(res, hotStreamCache);

		const articles = [];
		results.forEach(article => {
			if (articles.length < limit) {
				if (article.url.indexOf('marketslive') === -1) {
					articles.push(article);
				}
			}
		});

		const articleIds = [];
		articles.forEach(article => {
			articleIds.push(article.articleId);
		});


		es.searchArticles({
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

				const cleanResult = [];
				sortedResult.forEach((article) => {
					cleanResult.push(article);
				});
				articles.hits.hits = cleanResult;

				res.json(articles);
			} else {
				res.json({
					hits: {
						hits: []
					}
				});
			}
		}).catch(next);
	}).catch(next);
});

module.exports = router;
