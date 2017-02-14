const logger = require('./logger');
const client = require('./client');

const getListFromES = (region) => {
	const body = {
		size: 10000,
		fields: [],
		filter: {
			bool: {
				must: [ { range: { publishedDate: { gt: 'now-7d', lte: 'now' } } } ],
				must_not: [ { regexp: { provenance: '.*acast.*' } } ]
			}
		},
		sort: { id: 'asc' }
	};

	return client[region].search({
		index: 'content',
		type: 'item',
		body
	})
		.then(data => {
			if (data && data.hits && data.hits.hits) {
				return data.hits.hits.map((content) => content._id);
			} else {
				throw new Error('Elasticsearch responded with invalid data');
			}
		})
		.catch(err => {
			logger.error(err);
		});
};

const difference = (a, b) => {
	let i;
	let len;
	const unique = [];

	for (i = 0, len = a.length; i < len; i++) {
		b.indexOf(a[i]) === -1 && unique.push(a[i]);
	}

	for (i = 0, len = b.length; i < len; i++) {
		a.indexOf(b[i]) === -1 && unique.push(b[i]);
	}

	return unique;
};

const validateContent = (id) => {
	return Promise.all([
		fetchCapiV1(id),
		fetchCapiV2(id)
	])
		.then(([v1Response, v2Response]) => {
			const v1Status = v1Response.status;
			const v2Status = v2Response.status;

			// CAPI V1 may return a 403 because =/
			if (/^4/.test(v1Status) && v2Status === 404) {
				logger.info(`event=AUTO_SYNC_DELETE uuid=${id}`);
				return deleteItem(id);
			}

			if (v1Status === 200 || v2Status === 200) {
				logger.info(`event=AUTO_SYNC_INGEST uuid=${id}`);
				return ingestItem(id);
			}

			logger.info(`event=AUTO_SYNC_AMBIGUITY uuid=${id}`);
		});
};

const ingestItem = (id) => {
	return elastic.update(id);
};

const deleteItem = (id) => {
	return elastic.delete(id);
};

const fetchCapiV1 = (articleId) => {
	return fetch(`https://api.ft.com/content/items/v1/${articleId}`, {
		headers: { 'X-Api-Key': process.env.CAPI_API_KEY }
	});
};

const fetchCapiV2 = (articleId) => {
	return fetch(`https://${process.env.COCO_API_HOST}/enrichedcontent/${articleId}`, {
		headers: { 'Authorization': process.env.COCO_API_AUTHORIZATION }
	});
};

module.exports = () => {
	const start = Date.now();

	logger.info('event=AUTO_SYNC_WILL RUN');

	return Promise.all([
		getListFromES('us'),
		getListFromES('eu')
	])
	.then(([usList, euList]) => {
		const differences = difference(usList, euList);
		logger.info(`event=AUTO_SYNC_ITEMS_FOUND size=${differences.length}`);
		return Promise.all(differences.map(validateContent));
	})
	.then(() => {
		const time = ((Date.now() - start) / 1000).toFixed(2);
		logger.info(`event=AUTO_SYNC_COMPLETE time=${time}s`);
	})
	.catch((err) => {
		logger.error(`event=AUTO_SYNC_ERROR message=${err.message}`);
	});
};
