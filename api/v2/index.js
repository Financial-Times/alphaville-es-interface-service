const _ = require('lodash');
const router = new (require('express')).Router();
const es = require('../../es/v2/main');
const suds = require('../../services/suds');
const fastly = require('../../services/fastly');
const vanityRegex = /^\/article\/+([0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/?.*)$/;
const uuidRegex = /^\/article\/+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const mlVanityRegex = /(^\/marketslive\/+[0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?\/?)$/;
const mlUuidRegex = /^\/marketslive\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;


const KeenQuery = require('keen-query');

KeenQuery.setConfig({
	KEEN_PROJECT_ID: process.env.KEEN_PROJECT_ID,
	KEEN_READ_KEY: process.env.KEEN_READ_KEY,
	KEEN_HOST: 'https://keen-proxy.ft.com/3.0'
});

const getPopularArticles = () => new KeenQuery('page:view')
	.count()
	.group('page.location.pathname')
	.relTime('this_3_days')
	.filter('context.app=alphaville')
	.filter('user.subscriptions.isStaff!=true')
	.filter('page.location.pathname~/')
	.filter('page.location.pathname!=/')
	.filter('page.location.pathname!~/marketslive')
	.filter('page.location.pathname!~/search')
	.filter('page.location.pathname!~/uc_longroom')
	.filter('page.location.pathname!~/longroom')
	.filter('page.location.pathname!~/author')
	.filter('page.location.pathname!~/alphachat')
	.filter('page.location.pathname!~/meet-the-team')
	.filter('page.location.pathname!~/page')
	.print('json')
	.then(results => results.rows
		.map(([ pathname, count]) => ({ pathname, count }))
		.sort(({ count: countOne }, { count: countTwo }) => countTwo - countOne)
	);

const getMostCommentedArticles = () => new KeenQuery('comment:post')
	.count()
	.group('page.location.pathname')
	.relTime('this_3_days')
	.filter('context.app=alphaville')
	.filter('user.subscriptions.isStaff!=true')
	.filter('page.location.pathname~/')
	.filter('page.location.pathname!~/marketslive')
	.filter('page.location.pathname!~/longroom')
	.print('json')
	.then(results => results.rows
		.map(([ pathname, count]) => ({ pathname, count }))
		.sort(({ count: countOne }, { count: countTwo }) => countTwo - countOne)
	);

const getMostPopularTopic = () => new KeenQuery('page:view')
	.count()
	.group('page.location.pathname')
	.relTime('this_14_days')
	.filter('context.app=alphaville')
	.filter('user.subscriptions.isStaff!=true')
	.filter('page.location.pathname~/topic')
	.print('json')
	.then(results => results.rows
		.map(([ pathname, count]) => ({ pathname, count }))
		.sort(({ count: countOne }, { count: countTwo }) => countTwo - countOne)
	);


const KeenQueryPoller = require('../../services/KeenQueryPoller');

const popularArticlesPoller = new KeenQueryPoller(getPopularArticles);
const mostCommentedArticlesPoller = new KeenQueryPoller(getMostCommentedArticles);
const mostPopularTopicPoller = new KeenQueryPoller(getMostPopularTopic);


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
			res.set('Surrogate-Control', 'max-age=' + value);
		} else {
			setNoCache(res);
		}
	} else {
		setNoCache(res);
	}
};

const setNoCache = (res) => {
	res.set('Surrogate-Control', 'max-age=0');
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
			.then(response => {
				setCache(res, indexStreamCache);
				res.json(response);
			})
			.catch(next);
	} else {
		if (sanitizedSearchString.length > process.env['SEARCH_MAX_LENGTH']) {
			return res.json({
				items: [],
				total: 0
			});
		}

		const searchQuery = {
			min_score: 0.8,
			query: {
				multi_match: {
					query: sanitizedSearchString,
					type: 'most_fields',
					fields: ['frontmatter', 'bodyHTML']
				}
			}
		};

		esQuery = _.merge(esQuery, searchQuery);

		es.searchArticles(esQuery).then(response => {
				if (response) {
					setCache(res, searchStreamCache);
					res.json(response);
				} else {
					res.json({
						items: [],
						total: 0
					});
				}
			})
			.catch(next);
	}
});

const handleVanityArticle = (req, res, next) => {
	const matchVanity = sanitizeParam(req.params[0]).match(/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/([0-9]+)\/(.*)/);
	if (!matchVanity || !matchVanity.length) {
		return next();
	}

	const urlToSearch = `*://ftalphaville.ft.com/*/*/*/${matchVanity[1]}/${matchVanity[2]}/`;
	return es.getArticleByUrl(urlToSearch)
		.then(article => {
			if (!article) {
				setNoCache(res);
				res.status(404);
			} else if (article.isMarketsLive) {
				if (article.isLive) {
					setNoCache(res);
				} else {
					const today = new Date();
					const publishedDate = new Date(article.publishedDate);

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
			if (!article) {
				setNoCache(res);
				res.status(404);
			} else if (article.isMarketsLive) {
				if (article.isLive) {
					setNoCache(res);
				} else {
					const today = new Date();
					const publishedDate = new Date(article.publishedDate);

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
				match: {
					byline: {
						query: `*${authorString}*`,
						operator: "and"
					}
				}
			}
		};
		esQuery = _.merge(esQuery, authorQuery);
	}
	es.searchArticles(esQuery)
		.then(response => {
			setCache(res, authorStreamCache);

			res.json(response);
		})
		.catch(next);
});

//marketslive
router.get('/marketslive', (req, res, next) => {
	// backward and forward compatibility with the transition from sections to topics
	const mlQuery = {
		query: {
			bool: {
				should: [
					{
						"nested": {
							"path": "annotations",
							"query": {
								"bool": {
									"must": [
										{ "term": { "annotations.predicate": "http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy" } },
										{ "term": { "annotations.id": "d969d76e-f8f4-34ae-bc38-95cfd0884740" } }
									]
								}
							}
						}
					},
					{
						"nested": {
							"path": "annotations",
							"query": {
								"bool": {
									"must": [
										{ "term": { "annotations.predicate": "http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy" } },
										{ "term": { "annotations.id": "c91b1fad-1097-468b-be82-9a8ff717d54c" } }
									]
								}
							}
						}
					},
					{
						"nested": {
							"path": "annotations",
							"query": {
								"bool": {
									"must": [
										{ "term": { "annotations.predicate": "http://www.ft.com/ontology/annotation/about" } },
										{ "term": { "annotations.id": "c91b1fad-1097-468b-be82-9a8ff717d54c" } }
									]
								}
							}
						}
					}
				],
				filter: [
					{
						term: {
							"realtime": true
						}
					}
				]
			}
		}
	};
	const esQuery = _.merge(getEsQueryForArticles(req), mlQuery);

	es.searchArticles(esQuery)
		.then(response => {
			if (response) {
				let isLive = false;
				response.items.forEach(article => {
					if (article.isLive) {
						isLive = true;
					}
				});

				if (!isLive) {
					setCache(res, mlStreamCache);
				} else {
					setNoCache(res);
				}

				res.json(response);
			} else {
				const emptyResult = [];
				emptyResult.total = 0;
				res.json(emptyResult);
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
		}).then(response => {
			if (response) {
				const sortedResult = [];
				response.items.forEach((article) => {
					if (articleIds.indexOf(article.id) >= 0) {
						sortedResult[articleIds.indexOf(article.id)] = article;
					}
				});

				response.items = sortedResult.filter(a => a !== null);

				res.json(response);
			} else {
				res.json({
					items: [],
					total: 0
				});
			}
		});
	}).catch(next);
});

router.get('/most-read', (req, res, next) => {
	let limit = 30;
	if (req.query.limit) {
		limit = parseInt(req.query.limit, 10);
	}

	setCache(res, hotStreamCache);

	popularArticlesPoller.get(limit).then(obj => {

		const transformPromises = [];
		let articles = [];

		obj.forEach((article) => {
			const urlToSearch = `*://ftalphaville.ft.com/${sanitizeParam(article.pathname)}/`;
			articles.push({url:urlToSearch, count:article.count});
		});

		articles.forEach((article, index, source) => {
			transformPromises.push(Promise.all([
				es.getArticleByUrl(article.url).then(response => {
					if (response) {
						response.count = article.count;
					}
					source[index] = response;
				})
			]));
		});

		return Promise.all(transformPromises).then(() => {
			articles = articles.filter(article => article !== null).slice(0, limit);

			res.json({
				items: articles,
				total: articles.length
			});
		});

	}).catch(next);
});

router.get('/most-commented', (req, res, next) => {
	let limit = 30;
	if (req.query.limit) {
		limit = parseInt(req.query.limit, 10);
	}

	setCache(res, hotStreamCache);

	mostCommentedArticlesPoller.get(limit + 5).then(obj => {
		const transformPromises = [];
		let articles = [];

		obj.forEach((article) => {
			const urlToSearch = `*://ftalphaville.ft.com/${sanitizeParam(article.pathname)}/`;
			articles.push({url:urlToSearch, count:article.count});
		});

		articles.forEach((article, index, source) => {
			transformPromises.push(Promise.all([
				es.getArticleByUrl(article.url).then(response => {
					if (response) {
						response.count = article.count;
					}
					source[index] = response;
				})
			]));
		});

		return Promise.all(transformPromises).then(() => {
			articles = articles.filter(article => article !== null).slice(0, limit);

			res.json({
				items: articles,
				total: articles.length
			});
		});

	}).catch(next);
});

router.get('/popular-topic', (req, res, next) => {
	let limit = 5;
	if (req.query.limit) {
		limit = parseInt(req.query.limit, 10);
	}

	setCache(res, hotStreamCache);

	mostPopularTopicPoller.get(limit + 5).then(results => {
		res.json(results);
	}).catch(next);

});

router.get('/type', (req, res, next) => {
	const type = req.query.type;
	let esQuery = getEsQueryForArticles(req);

	if (type === 'Guest post'){
		esQuery = _.merge(esQuery, {
			query: {
				bool: {
					must: [
						{
							wildcard: {
								webUrl: "*guest-post*"
							}
						},{
							match_phrase: {
								byline: "Guest writer"
							}
						}
					]
				}
			}
		});
	} else if (type === 'FT Opening Quote'){
		esQuery = _.merge(esQuery, {
			query: {
				bool: {
					must: [
						{
							wildcard: {
								webUrl: "*opening-quote*"
							}
						}
					]
				}
			}
		});
	} else {
		esQuery = _.merge(esQuery, {
			query: {
				wildcard: {
					webUrl: `*${type.toLowerCase().replace(' ', '-')}*`
				}
			}
		});

	}

	es.searchArticles(esQuery)
		.then(response => {
			setCache(res, searchStreamCache);
			res.json(response);
		})
		.catch(next);
});


router.get('/series', (req, res, next) => {
	const series = req.query.series;
	let esQuery = getEsQueryForArticles(req);
	const seriesQuery = {
		query: {
			nested: {
				path: "annotations",
				query: {
					bool: {
						filter: [
							{ term: { "annotations.directType": "http://www.ft.com/ontology/AlphavilleSeries" } },
							{ term: { "annotations.prefLabel": series } }
						]
					}
				}
			}
		}
	};
	esQuery = _.merge(esQuery, seriesQuery);
	es.searchArticles(esQuery)
		.then(response => {
			setCache(res, searchStreamCache);
			res.json(response);
		})
		.catch(next);
});


router.get('/topic', (req, res, next) => {
	const topic = req.query.topic;
	let esQuery = getEsQueryForArticles(req);
	const topicQuery = {
		query: {
			nested: {
				path: "annotations",
				query: {
					bool: {
						filter: [
							{ term: { "annotations.directType": "http://www.ft.com/ontology/Topic" } },
							{ term: { "annotations.prefLabel": topic } }
						]
					}
				}
			}
		}
	};
	esQuery = _.merge(esQuery, topicQuery);
	es.searchArticles(esQuery)
		.then(response => {
			setCache(res, searchStreamCache);
			res.json(response);
		})
		.catch(next);
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
