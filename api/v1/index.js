const _ = require('lodash');
const router = new (require('express')).Router();
const es = require('alphaville-es-interface');
const suds = require('../../services/suds');

const vanityRegex = /^\/article\/+([0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/?.*)$/;
const uuidRegex = /^\/article\/+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const mlVanityRegex = /(\/marketslive\/[0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?\/?)$/;
const mlUuidRegex = /^\/marketslive\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

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
		.then(articles => res.json(articles))
		.catch(next);
});

const handleVanityArticle = (req, res, next) => {
	let urlToSearch = `*://ftalphaville.ft.com/${req.params[0]}/`;
	return es.getArticleByUrl(urlToSearch)
		.then(article => res.json(article))
		.catch(next);
};

const handleUuidArticle = (req, res, next) => {
	return es.getArticleByUuid(req.params[0])
		.then(article => res.json(article))
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
		.then(articles => res.json(articles))
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
		.then(articles => res.json(articles))
		.catch(next);
});

router.get(mlVanityRegex, handleVanityArticle);
router.get(mlUuidRegex, handleUuidArticle);

router.get('/hotarticles', (req, res, next) => {
	let limit = 10;
	if (req.query.limit) {
		limit = parseInt(req.query.limit);

		if (limit > 90) {
			limit = 90;
		}
	}

	suds.getHotArticles({
		tag: 'alphaville',
		count: limit + 10
	}).then(results => {
		if (process.env.NODE_ENV === 'production') {
			res.set('Cache-Control', 'public, max-age=300');
		} else {
			res.set('Cache-Control', 'private, no-cache, no-store');
		}

		const articles = [];
		results.forEach((article) => {
			if (articles.length < limit) {
				if (article.url.indexOf('marketslive') === -1) {
					articles.push(article);
				}
			}
		});

		res.json(articles);
	}).catch(next);
});

module.exports = router;
