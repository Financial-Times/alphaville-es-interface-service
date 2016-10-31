const router = require('express').Router();
const es = require('alphaville-es-interface');
const vanityRegex = /^\/article(\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/.*)$/;
const uuidRegex = /^\/article\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

console.log('loading');

router.get('/articles', (req, res) => {
	let offset = req.query.offset || 0;
	let limit = req.query.limit || 30;

	es.searchArticles({
		sort: {
			publishedDate: {
				order: 'desc'
			}
		},
		from: offset,
		size: limit
	})
	.then(articles => res.json(articles))
	.catch(console.log);
});

router.get(vanityRegex,  (req, res) => {
	let urlToSearch = req.params[0];
	if (urlToSearch[0] === '/') {
		urlToSearch = urlToSearch.substr(1, urlToSearch.length);
	}
	if (urlToSearch[urlToSearch.length - 1] === '/') {
		urlToSearch = urlToSearch.substr(0, urlToSearch.length - 1);
	}

	urlToSearch = `*://ftalphaville.ft.com/${urlToSearch}/`;

	return es.getArticleByUrl(urlToSearch)
		.then(article => res.json(article))
		.catch(console.log);
});


router.get(uuidRegex, (req, res) => {
	return es.getArticleByUuid(req.params[0])
		.then(article => res.json(article))
		.catch(console.log)
});

module.exports = router;
